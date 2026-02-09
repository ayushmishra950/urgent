
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SalarySlipCard = ({ data, onClose }) => {
  const slipRef = useRef();

  const downloadPDF = () => {
    const input = slipRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Salary_Slip_${data.employeeId?._id || 'unknown'}.pdf`);
      onClose();
    });
  };

  const netPay = (data.basic || 0) + (data.allowance || 0) - (data.deductions || 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '10px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          width: '700px',
          maxWidth: '100%',
          padding: '20px',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {/* Salary Slip */}
        <div ref={slipRef} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
          <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Infonic Solution Private Limited</h2>
          <p style={{ textAlign: 'center', marginBottom: '10px' }}>
            Salary Slip - {data.month} {data.year}
          </p>
          <hr />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <p>
              <strong>Name:</strong> {data.employeeId?.fullName || 'N/A'}
            </p>
            <p>
              <strong>Employee ID:</strong> {data.employeeId?._id || 'N/A'}
            </p>
            <p>
              <strong>Department:</strong> {data.departmentId?.name || 'N/A'}
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Earnings</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Amount (₹)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Deductions</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Basic Salary</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.basic || 0}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Deductions</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.deductions || 0}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Allowance</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.allowance || 0}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: '20px', textAlign: 'right' }}>Net Pay: ₹{netPay}</h3>
        </div>

        {/* Download Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={downloadPDF}
            style={{
              padding: '10px 20px',
              background: '#2c3e50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipCard;
