const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const xlsx = require("xlsx");
const pdfParse = require("pdf-parse");

const catalogDir = path.join(__dirname, "..", "..", "catalog");
const outputPath = path.join(__dirname, "products.json");

const REQUIRED_FIELDS = ["code", "name", "category", "subcategory", "serial", "price"];

function normalize(value) {
  return String(value || "").trim();
}

function ensureRecordShape(record, source) {
  const normalized = {
    code: normalize(record.code),
    name: normalize(record.name),
    category: normalize(record.category),
    subcategory: normalize(record.subcategory || ""),
    serial: normalize(record.serial || ""),
    price: normalize(record.price || "")
  };

  REQUIRED_FIELDS.forEach((field) => {
    if (field === "subcategory" || field === "serial" || field === "price") {
      return;
    }

    if (!normalized[field]) {
      throw new Error(`Missing ${field} in ${source}`);
    }
  });

  return normalized;
}

function readCsvFiles() {
  const files = fs.readdirSync(catalogDir).filter((file) => file.toLowerCase().endsWith(".csv"));
  const records = [];

  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(catalogDir, file), "utf8");
    const rows = parse(raw, {
      delimiter: ";",
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true
    });

    let headings = [];

    rows.forEach((row) => {
      const cells = row.map((cell) => normalize(cell));
      const codeCell = cells[0] || "";
      const siglaCell = cells[1] || "";
      const descCell = cells[2] || "";
      const priceCell = cells[3] || "";

      if (codeCell.toLowerCase() === "codice") {
        return;
      }

      const isHeading =
        codeCell &&
        !siglaCell &&
        !descCell &&
        cells.slice(3).every((cell) => !cell);

      if (isHeading) {
        headings = [...headings, codeCell].slice(-3);
        return;
      }

      if (!codeCell || !descCell) {
        return;
      }

      const category = headings[headings.length - 1] || "";
      const subcategory = headings[headings.length - 2] || "";

      records.push(
        ensureRecordShape(
          {
            code: codeCell,
            name: descCell,
            category,
            subcategory,
            serial: siglaCell,
            price: priceCell
          },
          `CSV:${file}`
        )
      );
    });
  });

  return { files, records };
}

function readXlsxFiles() {
  const files = fs.readdirSync(catalogDir).filter((file) => file.toLowerCase().endsWith(".xlsx"));
  const records = [];
  files.forEach((file) => {
    const workbook = xlsx.readFile(path.join(catalogDir, file));
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
      rows.forEach((row) => {
        records.push(ensureRecordShape(row, `XLSX:${file}:${sheetName}`));
      });
    });
  });
  return { files, records };
}

async function readPdfFiles() {
  const files = fs.readdirSync(catalogDir).filter((file) => file.toLowerCase().endsWith(".pdf"));
  const texts = [];
  for (const file of files) {
    const dataBuffer = fs.readFileSync(path.join(catalogDir, file));
    const parsed = await pdfParse(dataBuffer);
    texts.push({ file, text: parsed.text || "" });
  }
  return { files, texts };
}

function crossCheck(csvRecords, xlsxRecords) {
  const byCode = new Map();

  csvRecords.forEach((record) => {
    byCode.set(record.code, { csv: record, xlsx: null });
  });

  xlsxRecords.forEach((record) => {
    const current = byCode.get(record.code) || { csv: null, xlsx: null };
    current.xlsx = record;
    byCode.set(record.code, current);
  });

  const merged = [];
  const inconsistencies = [];

  byCode.forEach((value, code) => {
    const csv = value.csv;
    const xlsx = value.xlsx;

    if (!csv && xlsx) {
      merged.push(xlsx);
      return;
    }

    if (csv && !xlsx) {
      merged.push(csv);
      return;
    }

    const fieldsMatch = ["name", "category", "subcategory"].every(
      (field) => normalize(csv[field]) === normalize(xlsx[field])
    );

    if (!fieldsMatch) {
      inconsistencies.push({ code, csv, xlsx });
    }

    merged.push(csv);
  });

  return { merged, inconsistencies };
}

async function build() {
  if (!fs.existsSync(catalogDir)) {
    throw new Error(`Catalog directory not found: ${catalogDir}`);
  }

  const { files: csvFiles, records: csvRecords } = readCsvFiles();
  const { files: xlsxFiles, records: xlsxRecords } = readXlsxFiles();
  const { files: pdfFiles } = await readPdfFiles();

  if (csvFiles.length === 0 && xlsxFiles.length === 0) {
    throw new Error("No CSV or XLSX files found in catalog directory.");
  }

  const { merged, inconsistencies } = crossCheck(csvRecords, xlsxRecords);

  if (inconsistencies.length > 0) {
    const reportPath = path.join(__dirname, "inconsistencies.json");
    fs.writeFileSync(reportPath, JSON.stringify(inconsistencies, null, 2));
    console.warn(`Inconsistencies found. See ${reportPath}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));

  console.log("Catalog build complete.");
  console.log(`CSV files: ${csvFiles.length}, XLSX files: ${xlsxFiles.length}, PDF files: ${pdfFiles.length}`);
  console.log(`Products: ${merged.length}`);
}

build().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
