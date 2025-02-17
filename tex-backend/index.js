const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());


mongoose
  .connect(
    "mongodb+srv://Shahil:Fake123@cluster0.xdocm.mongodb.net/texDB?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


const taxRecordSchema = new mongoose.Schema({
  annualIncome: Number,
  investments: Number,
  otherDeductions: Number,
  otherIncome: Number,
  taxableIncome: Number,
  taxPayable: Number,
  timestamp: { type: Date, default: Date.now },
});

const TaxRecord = mongoose.model("TaxRecord", taxRecordSchema);

// Tax Calculation Logic
function calculateTax(taxableIncome) {
  let tax = 0;
  const SLABS = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];

  for (let i = 1; i < SLABS.length; i++) {
    if (taxableIncome > SLABS[i - 1].limit) {
      const taxableAmount = Math.min(
        taxableIncome - SLABS[i - 1].limit,
        SLABS[i].limit - SLABS[i - 1].limit
      );
      tax += taxableAmount * SLABS[i].rate;
    }
  }

  return tax * 1.04; 
}


app.post("/api/calculate-tax", async (req, res) => {
  try {
    const { annualIncome, investments, otherDeductions, otherIncome } =
      req.body;

   
    if (
      [annualIncome, investments, otherDeductions, otherIncome].some(
        (val) => typeof val !== "number" || val < 0
      )
    ) {
      return res.status(400).json({ error: "Invalid input values" });
    }

    const taxableIncome = Math.max(
      annualIncome + otherIncome - investments - otherDeductions,
      0
    );

    const taxPayable = calculateTax(taxableIncome);


    await new TaxRecord({
      ...req.body,
      taxableIncome,
      taxPayable,
    }).save();

    res.json({ taxableIncome, taxPayable });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/tax-records", async (req, res) => {
  try {
    const records = await TaxRecord.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
