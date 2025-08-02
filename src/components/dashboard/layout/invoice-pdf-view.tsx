'use client';

import { useMemo, useState } from 'react';
import { Box, Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import { Question, X } from '@phosphor-icons/react';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Printer } from '@phosphor-icons/react/dist/ssr/Printer';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
}
export default function PdfViewer({ fileUrl, onClose, open }: PdfViewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'document.pdf';
    link.click();
  };

  // Memoize the Document component so that it doesn't re-render unnecessarily
  const renderDocument = useMemo(() => {
    return (
      <Document file={{ url: '' }} onLoadSuccess={onDocumentLoadSuccess}>
        <Box sx={{ overflow: 'auto', maxHeight: '80vh' }}>
          <Page pageNumber={pageNumber} scale={scale} width={800} />
        </Box>
      </Document>
    );
  }, [pageNumber, scale]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Invoice Preview
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 13,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>
      <Box sx={{ width: '100%', maxWidth: '900px', mx: 'auto', textAlign: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <IconButton onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
              <Minus size={20} />
            </IconButton>
            <Typography component="span" sx={{ mx: 1 }}>{`${Math.round(scale * 100)}%`}</Typography>
            <IconButton onClick={() => setScale(scale + 0.1)}>
              <Plus size={20} />
            </IconButton>
          </Box>

          <Box>
            <IconButton>
              <MagnifyingGlass size={20} />
            </IconButton>
            <IconButton
            // onClick={handleDownload}
            >
              <DownloadSimple size={20} />
            </IconButton>
            <IconButton onClick={() => window.print()}>
              <Printer size={20} />
            </IconButton>
          </Box>
        </Box>

        {/* {renderDocument} */}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IconButton onClick={() => setPageNumber((p) => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography sx={{ mx: 2 }}>
            Page {pageNumber} of {numPages}
          </Typography>
          <IconButton
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages!))}
            disabled={pageNumber >= (numPages ?? 1)}
          >
            <ArrowRight size={20} />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}
