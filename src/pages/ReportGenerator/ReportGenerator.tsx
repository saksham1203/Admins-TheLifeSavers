import React, { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FaArrowLeft,
  FaFileUpload,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ReportGenerator: React.FC = () => {
  const navigate = useNavigate();

  const letterheadInput = useRef<HTMLInputElement>(null);
  const reportInput = useRef<HTMLInputElement>(null);

  const [letterhead, setLetterhead] = useState<File | null>(null);
  const [report, setReport] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLetterheadUpload = (file: File) => {
    setLetterhead(file);
  };

  const handleReportUpload = (file: File) => {
    setReport(file);
  };

  const generateReport = async () => {
    if (!letterhead || !report) {
      alert("Please upload both PDFs.");
      return;
    }

    try {
      setLoading(true);

      const letterheadBytes = await letterhead.arrayBuffer();
      const reportBytes = await report.arrayBuffer();

      const letterheadPdf = await PDFDocument.load(letterheadBytes);
      const reportPdf = await PDFDocument.load(reportBytes);

      const mergedPdf = await PDFDocument.create();

      const letterheadPage = letterheadPdf.getPages()[0];
      const reportPages = reportPdf.getPages();

      const embeddedLetterhead = await mergedPdf.embedPage(letterheadPage);

      for (let i = 0; i < reportPages.length; i++) {
        const embeddedReport = await mergedPdf.embedPage(reportPages[i]);

        const page = mergedPdf.addPage([
          embeddedReport.width,
          embeddedReport.height,
        ]);

        const { width, height } = page.getSize();

        page.drawPage(embeddedReport, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });

        page.drawPage(embeddedLetterhead, {
          x: 0,
          y: height - embeddedLetterhead.height,
          width: width,
          height: embeddedLetterhead.height,
        });
      }

      const pdfBytes = await mergedPdf.save();

      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-report.pdf";
      a.click();

      URL.revokeObjectURL(url);

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error generating report");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full overflow-hidden relative animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:top-1/2 sm:left-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
          >
            <FaArrowLeft size={18} />
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0">
            Report Generator
          </h1>

          <p className="opacity-90 text-sm">
            Upload Letterhead and Lab Report to generate final formatted report
          </p>
        </div>

        {/* Content */}
        <div className="py-10 px-6 space-y-10">
          {/* Step Indicator */}
          <div className="flex justify-center items-center gap-6 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white">
                1
              </span>
              Upload Letterhead
            </div>

            <div className="w-10 h-[2px] bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white">
                2
              </span>
              Upload Report
            </div>

            <div className="w-10 h-[2px] bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white">
                3
              </span>
              Generate PDF
            </div>
          </div>

          {/* Upload Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Letterhead Upload */}
            <div
              onClick={() => letterheadInput.current?.click()}
              className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-transparent to-red-100 opacity-30"></div>

              <FaFileUpload
                className="mx-auto text-red-500 relative"
                size={40}
              />

              <h3 className="font-semibold mt-4 text-lg relative">
                Upload Letterhead
              </h3>

              <p className="text-sm text-gray-500 mt-1 relative">
                Click to select your letterhead PDF
              </p>

              {letterhead && (
                <div className="mt-4 flex justify-center">
                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-semibold">
                    ✓ {letterhead.name}
                  </span>
                </div>
              )}

              <input
                ref={letterheadInput}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleLetterheadUpload(e.target.files[0])
                }
              />
            </div>

            {/* Report Upload */}
            <div
              onClick={() => reportInput.current?.click()}
              className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-transparent to-red-100 opacity-30"></div>

              <FaFilePdf className="mx-auto text-red-500 relative" size={40} />

              <h3 className="font-semibold mt-4 text-lg relative">
                Upload Lab Report
              </h3>

              <p className="text-sm text-gray-500 mt-1 relative">
                Click to select your diagnostic report PDF
              </p>

              {report && (
                <div className="mt-4 flex justify-center">
                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-semibold">
                    ✓ {report.name}
                  </span>
                </div>
              )}

              <input
                ref={reportInput}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleReportUpload(e.target.files[0])
                }
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-3 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
            >
              <FaDownload />
              {loading ? "Generating..." : "Generate Final Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
