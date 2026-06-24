const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  jobDescription: { type: String, default: "" },
  sections: { type: Object, default: {} },
  result: { type: Object, default: {} },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analysis", AnalysisSchema);
