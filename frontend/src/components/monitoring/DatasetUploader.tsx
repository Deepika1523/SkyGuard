'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';

interface DatasetUploaderProps {
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

export const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.json')) {
        setFile(droppedFile);
        setErrorMessage(null);
      } else {
        setErrorMessage('Invalid file format. Please upload a .csv or .json file.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDownloadSample = () => {
    const sampleUrl = 'http://127.0.0.1:8000/api/dataset/sample/';
    window.open(sampleUrl, '_blank');
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/dataset/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload dataset');
      }

      setUploadResult(data);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-4xl w-full mx-auto relative text-slate-100 font-sans">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 rounded-lg bg-slate-800/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Weather Dataset Ingestion Uploader</h2>
          <p className="text-sm text-slate-400">Upload custom CSV telemetry datasets to run through the 4-Level SkyGuard AI Pipeline.</p>
        </div>
      </div>

      {!uploadResult ? (
        <div className="space-y-6">
          {/* File Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging 
                ? 'border-blue-500 bg-blue-500/10' 
                : file 
                ? 'border-emerald-500/40 bg-emerald-500/5' 
                : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/40'
            }`}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".csv,.json" 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            {file ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-medium text-emerald-300 text-lg">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB — Ready for AI analysis</p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-rose-400 hover:text-rose-300 underline mt-2"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Drag and drop your dataset CSV or JSON here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports standard IMD AWS telemetry schema (`station_id`, `temperature`, `humidity`, `pressure`)</p>
                </div>
                <span className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-700">
                  Browse File
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3 text-rose-300 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center space-x-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample CSV Template</span>
            </button>

            <button
              type="button"
              disabled={!file || isUploading}
              onClick={handleUpload}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                !file || isUploading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 border border-blue-500'
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing through AI Engine...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Ingest & Run AI Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Result Summary Dashboard */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-base">{uploadResult.message}</p>
              <p className="text-xs text-emerald-300/80">Dataset has been registered into SQLite database and evaluated across 4-level AI models.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium">Readings Created</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{uploadResult.summary.readings_created}</p>
              <span className="text-[10px] text-slate-400">Total ingested rows</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <p className="text-xs text-amber-400/90 font-medium">Anomalies Flagged</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">{uploadResult.summary.anomalies_flagged}</p>
              <span className="text-[10px] text-amber-400/80">QC & ML detections</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <p className="text-xs text-rose-400/90 font-medium">Alerts Dispatched</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{uploadResult.summary.alerts_created}</p>
              <span className="text-[10px] text-rose-400/80">High/Critical severity</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <p className="text-xs text-blue-400/90 font-medium">Data Imputations</p>
              <p className="text-2xl font-bold text-blue-300 mt-1">{uploadResult.summary.imputations_count}</p>
              <span className="text-[10px] text-blue-400/80">Missing gaps recovered</span>
            </div>
          </div>

          {/* Ingestion Preview Table */}
          {uploadResult.preview && uploadResult.preview.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Sample Ingestion Pipeline Results (First 20 Rows)</span>
              </h3>
              <div className="overflow-x-auto max-h-56 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 sticky top-0 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Station ID</th>
                      <th className="px-3 py-2">Classification</th>
                      <th className="px-3 py-2">Fault Type</th>
                      <th className="px-3 py-2">Severity</th>
                      <th className="px-3 py-2">Imputed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {uploadResult.preview.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-mono text-slate-400">#{item.row}</td>
                        <td className="px-3 py-2 font-medium text-slate-200">{item.station_id}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.classification === 'NORMAL' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : item.classification === 'GENUINE_WEATHER_EVENT'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {item.classification}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">{item.fault_type}</td>
                        <td className="px-3 py-2">
                          <span className={`font-semibold ${
                            item.severity === 'CRITICAL' ? 'text-rose-400' :
                            item.severity === 'HIGH' ? 'text-amber-400' :
                            item.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-slate-400'
                          }`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {item.is_imputed ? (
                            <span className="text-blue-400 font-medium">Yes</span>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { setUploadResult(null); setFile(null); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700"
            >
              Upload Another Dataset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
