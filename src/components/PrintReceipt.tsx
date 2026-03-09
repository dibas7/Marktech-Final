import { Receipt } from '@/types/receipt';
import { Globe, Mail, Phone } from 'lucide-react';
import marktechLogo from '@/assets/marktech-logo-black.png';
import { formatNepaliDate } from '@/utils/nepaliDate';

interface PrintReceiptProps {
  receipts: Receipt[];
}

export function PrintReceipt({ receipts }: PrintReceiptProps) {
  if (receipts.length === 0) return null;
  
  const primaryReceipt = receipts[0];
  
  // One shared receipt number for all devices in this receipt
  const receiptNumberDisplay = primaryReceipt.receipt_number;
  const nepaliDate = formatNepaliDate(primaryReceipt.received_date);
  
  // Font styles for professional receipt look
  const labelFont = { fontFamily: "'Roboto Condensed', Arial, sans-serif", fontWeight: 600 };
  const dataFont = { fontFamily: "'Courier Prime', 'Courier New', monospace", fontWeight: 400 };
  const headerFont = { fontFamily: "'Roboto Condensed', Arial, sans-serif", fontWeight: 700, letterSpacing: '3px' };
  
  return (
    <div 
      className="receipt-print bg-white text-black"
      style={{ 
        width: '210mm',
        height: '148.5mm',
        padding: '3mm 5mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        ...labelFont
      }}
    >
      {/* Background watermark */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: 0.2,
        }}
      >
        <img
          src={marktechLogo}
          alt="MarkTech watermark"
          style={{ width: '90mm', height: 'auto' }}
        />
      </div>

      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: '1mm' }}>
        {/* Logo - Larger */}
        <div style={{ width: '18mm', flexShrink: 0 }}>
          <img src={marktechLogo} alt="MarkTech Nepal" style={{ height: '16mm', width: 'auto' }} />
        </div>
        
        {/* Title - Larger and bolder */}
        <div className="text-center flex-1" style={{ padding: '0 2mm' }}>
          <h1 style={{ ...headerFont, fontSize: '30pt', margin: 0, lineHeight: 1.1 }}>
          


            <h1 className="text-[30pt] font-extrabold font-serif">
 MARKTECH NEPAL
</h1>

          </h1>
          <h2 style={{ 
            ...labelFont, 
            fontSize: '17pt', 
            margin: '1.5mm 0 0 0',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            fontWeight: 700
          }}>
            MAINTENANCE RECEIPT 
          </h2>
        </div>
        
        {/* Address & Contact - Larger text */}
        <div className="text-right" style={{ fontSize: '9pt', lineHeight: 1.3, flexShrink: 0, width: '42mm', fontWeight: 600 }}>
          <p style={{ margin: 0 }}>22, Tadhahiti Galli, New Road</p>
          <p style={{ margin: 0 }}>Kathmandu, Nepal</p>
          <p style={{ margin: 0 }}>Tel: +977-1-5320125</p>
          <div className="flex items-center justify-end" style={{ gap: '1.5mm' }}>
            {/* Clear WhatsApp icon */}
            <svg style={{ width: '9px', height: '9px' }} viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {/* Clear Viber icon using Phone icon as replacement */}
            <Phone size={9} style={{ color: '#7360F2' }} />
            <span>9766889852</span>
          </div>
          <div className="flex items-center justify-end" style={{ gap: '1.5mm' }}>
            <Globe size={9} />
            <span>marktechnepal.com</span>
          </div>
          <div className="flex items-center justify-end" style={{ gap: '1.5mm' }}>
            <Mail size={9} />
            <span>info@marktechnepal.com</span>
          </div>
        </div>
      </div>

      {/* Receipt Number and Date */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1mm', fontSize: '9pt' }}>
        <div className="flex items-baseline" style={{ gap: '2mm' }}>
          <span style={labelFont}>Receipt No.</span>
          <span style={{ ...dataFont, fontSize: '15pt', fontWeight: 700 }}>{receiptNumberDisplay}</span>
        </div>
        <div className="flex items-baseline" style={{ gap: '1mm' }}>
          <span style={labelFont}>Date:</span>
          <span style={{ ...dataFont, fontSize: ' 9pt' }}>{nepaliDate}</span>
        </div>
      </div>

      {/* Customer Info - name and contact on same line, no password on paper */}
      <div style={{ marginBottom: '3mm', fontSize: '9pt' }}>
        <div className="flex items-baseline" style={{ marginBottom: '0.5mm', gap: '4mm' }}>
          <div className="flex items-baseline" style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...labelFont, width: '24mm', flexShrink: 0 }}>Customer Name :</span>
            <span
              className="flex-1 border-b border-black"
              style={{ ...dataFont, paddingBottom: '0.5px', minHeight: '4mm' }}
            >
              {primaryReceipt.customer_name}
            </span>
          </div>
          <div className="flex items-baseline" style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...labelFont, width: '16mm', flexShrink: 0 }}>Contact :</span>
            <span
              className="flex-1 border-b border-black"
              style={{ ...dataFont, paddingBottom: '0.5px', minHeight: '4mm' }}
            >
              {primaryReceipt.customer_phone}
            </span>
          </div>
        </div>
      </div>

      {/* Devices Table - top/bottom borders only, no inner row lines */}
      <table 
        className="w-full border-collapse" 
        style={{ 
          marginBottom: '1mm',
          fontSize: '10pt',
          borderCollapse: 'collapse',
          tableLayout: 'fixed'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ ...labelFont, borderTop: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '0.8mm', textAlign: 'center', width: '6mm' }}>S.N</th>
            <th style={{ ...labelFont, borderTop: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '0.8mm', textAlign: 'center', width: '35mm' }}>Particulars</th>
            <th style={{ ...labelFont, borderTop: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '0.8mm', textAlign: 'center', width: '55mm'}}>Problem</th>
            <th style={{ ...labelFont, borderTop: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '0.8mm', textAlign: 'center', width: '20mm' }}>Model No.</th>
            <th style={{ ...labelFont, borderTop: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '0.8mm', textAlign: 'center', width: '25mm' }}>S.N/Service Tag</th>
          </tr>
        </thead>
        <tbody>
          {receipts.slice(0, 4).map((receipt, index) => {
            const isLastRow = receipts.length >= 4 && index === 3;
            const cellBorderBase = { borderLeft: '1px solid #000', borderRight: '1px solid #000' };
            const cellBorderBottom = { borderBottom: '1px solid #000' };
            return (
            <tr key={receipt.id}>
              <td style={{ ...dataFont, ...cellBorderBase, ...(isLastRow ? cellBorderBottom : {}), padding: '0.8mm', textAlign: 'center', height: '7mm', verticalAlign: 'top' }}>
                {index + 1}
              </td>
              <td style={{ ...dataFont, ...cellBorderBase, ...(isLastRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm', verticalAlign: 'top', textTransform: 'capitalize', fontSize: '8.5pt', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                {receipt.device_type}
                {receipt.accessories && <span style={{ display: 'block', fontSize: '7pt', color: '#555' }}>({receipt.accessories})</span>}
              </td>
              <td style={{ ...dataFont, ...cellBorderBase, ...(isLastRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm', verticalAlign: 'top', fontSize: '8.5pt', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                {receipt.problem_description}
              </td>
              <td style={{ ...dataFont, ...cellBorderBase, ...(isLastRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm', verticalAlign: 'top', fontSize: '8.5pt', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                {receipt.device_model || ''}
              </td>
              <td style={{ ...dataFont, ...cellBorderBase, ...(isLastRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm', verticalAlign: 'top', fontSize: '8.5pt', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                {receipt.serial_number || ''}
              </td>
            </tr>
          );})}
          {receipts.length < 4 && Array.from({ length: 4 - Math.min(receipts.length, 4) }).map((_, i) => {
            const isLastEmptyRow = i === 4 - Math.min(receipts.length, 4) - 1;
            const cellBorderBase = { borderLeft: '1px solid #000', borderRight: '1px solid #000' };
            const cellBorderBottom = { borderBottom: '1px solid #000' };
            return (
            <tr key={`empty-${i}`}>
              <td style={{ ...cellBorderBase, ...(isLastEmptyRow ? cellBorderBottom : {}), padding: '0.8mm', textAlign: 'center', height: '7mm' }}></td>
              <td style={{ ...cellBorderBase, ...(isLastEmptyRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm' }}></td>
              <td style={{ ...cellBorderBase, ...(isLastEmptyRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm' }}></td>
              <td style={{ ...cellBorderBase, ...(isLastEmptyRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm' }}></td>
              <td style={{ ...cellBorderBase, ...(isLastEmptyRow ? cellBorderBottom : {}), padding: '0.8mm', height: '7mm' }}></td>
            </tr>
          );})}
        </tbody>
      </table>

      {/* Terms & VAT notice - two tight lines, no extra gap */}
      <div className="text-center" style={{ fontSize: '8pt', lineHeight: 1.6, marginBottom: '1mm' }}>
        <p style={{ margin: 0 }}>
          <span style={{ fontWeight: 600 }}>सूचना:</span>{' '}
          मर्मतको लागि छाडेको सामान ६० दिनसम्म नलगि थप क्षति भए वा हराएमा कम्पनी जबाफदेही हुनेछैन। मर्मत खर्चमा अतिरिक्त मूल्य अभिवृद्धि कर (VAT) लाग्नेछ।
        </p>
        <p style={{ ...labelFont, fontSize: '8pt', margin: 0 }}>
          
        </p>
      </div>

      {/* Signature Section - Moved up, compact */}
      <div className="flex justify-between" style={{ marginBottom: '1mm', padding: '0 13mm' }}>
        <div style={{ textAlign: 'center', width: '28mm' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5mm', height: '6mm' }}></div>
          <p style={{ ...labelFont, fontSize: '10.5pt', margin: 0 }}>EDD</p>
        </div>
        <div style={{ textAlign: 'center', width: '28mm' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5mm', height: '6mm' }}></div>
          <p style={{ ...labelFont, fontSize: '10.5pt', margin: 0 }}>For MKTN</p>
        </div>
      </div>

      {/* Spacer to push bottom content down */}
      <div style={{ flex: 1, minHeight: '0.5mm' }}></div>

      {/* Horizontal line above Please return this slip */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid #000',
          marginBottom: '3mm',
        }}
      ></div>

      {/* Return Slip Notice - At the very bottom */}
      <div className="text-center" style={{ marginBottom: '7mm' }}>
        <p style={{ 
          ...headerFont, 
          fontSize: '11pt', 
          fontWeight: 600,
          margin: 0,
          padding: '1mm 3mm',
          
          display: 'inline-block',
          letterSpacing: '0.4.3px'
        }}>
          Contact us for Laptop, Desktop, Projector, Printer, and all kinds of computer Accessories maintenance and sales.
        </p>
      </div>

      {/* Contact us for - Combined text */}
      <div className="text-center" >
        <p style={{ 
          ...headerFont, 
          
          border: '`2px solid #000',
          
          fontSize: '15pt', 
          fontWeight:600,
          margin: 1, 
          letterSpacing: '1.5px',
          marginTop: '-1px',
          
          

          
        }}>
          
          
  
          PLEASE RETURN THIS SLIP
        </p>
      </div>
      </div>
    </div>
  );
}
