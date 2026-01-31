/**
 * QR code generator page for admin.
 */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const [qrData, setQrData] = useState(null);
  const [qrImages, setQrImages] = useState({});
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  useEffect(() => {
    fetchQRData();
  }, []);

  const fetchQRData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/qr-codes', { headers: getAuthHeaders() });
      setQrData(response.data);
      
      // Generate QR code images for all active tables
      const images = {};
      for (const table of response.data.tables) {
        try {
          const qrImage = await QRCode.toDataURL(table.url, { width: 300 });
          images[table.table_number] = qrImage;
        } catch (error) {
          console.error(`Failed to generate QR for table ${table.table_number}:`, error);
        }
      }
      setQrImages(images);
    } catch (error) {
      toast.error('Failed to load QR code data');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (tableNumber, url) => {
    const link = document.createElement('a');
    link.href = qrImages[tableNumber];
    link.download = `table_${tableNumber}_qr.png`;
    link.click();
  };

  const downloadAll = () => {
    Object.keys(qrImages).forEach(tableNumber => {
      setTimeout(() => {
        downloadQR(tableNumber, qrData.tables.find(t => t.table_number === parseInt(tableNumber)).url);
      }, parseInt(tableNumber) * 100);
    });
    toast.success('Downloading all QR codes...');
  };

  if (loading) {
    return <div className="text-center py-12">Loading QR codes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">QR Codes</h2>
        <button
          onClick={downloadAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Download All
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Base URL:</strong> {qrData?.base_url}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Each QR code links to the menu page for that specific table.
        </p>
        <p className="text-sm text-blue-600 mt-2">
          <strong>Total Active Tables:</strong> {qrData?.tables.length || 0}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrData?.tables.map((table) => (
          <div key={table.table_number} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Table {table.table_number}
            </h3>
            
            {qrImages[table.table_number] ? (
              <div className="mb-4 flex justify-center">
                <img
                  src={qrImages[table.table_number]}
                  alt={`QR Code for Table ${table.table_number}`}
                  className="border border-gray-200 rounded"
                />
              </div>
            ) : (
              <div className="mb-4 h-[300px] flex items-center justify-center bg-gray-100 rounded">
                <p className="text-gray-500">Generating QR code...</p>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">URL:</p>
              <p className="text-xs font-mono text-gray-700 break-all">{table.url}</p>
            </div>
            
            <button
              onClick={() => downloadQR(table.table_number, table.url)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download QR Code
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
