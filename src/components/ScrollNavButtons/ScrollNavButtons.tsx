import { useState, useEffect, useLayoutEffect } from "react";
import { Fab, Stack, Tooltip } from "@mui/material";
import { ArrowUp, ArrowDown } from "@phosphor-icons/react";

export default function ScrollNavButtons() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const checkScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    setIsAtTop(scrollTop === 0);
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
  };

  useLayoutEffect(() => {
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  // Separate delayed check on mount for correct initial state
  useEffect(() => {
    const timer = setTimeout(checkScroll, 300); // wait for full page render
    return () => clearTimeout(timer);
  }, []);

  if (isAtTop && isAtBottom) return null;

  return (
    <Stack spacing={1} sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}>
      {!isAtTop && (
        <Tooltip title="Scroll to Top" placement="left"
            componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
          },
        },
      },
    },
  }}
        >
          <Fab size="small" onClick={scrollToTop} color="primary">
            <ArrowUp size={20} weight="bold" />
          </Fab>
        </Tooltip>
      )}
      {!isAtBottom && (
        <Tooltip title="Scroll to Bottom" placement="left"
            componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
          },
        },
      },
    },
  }}
        >
          <Fab size="small" onClick={scrollToBottom} color="primary">
            <ArrowDown size={20} weight="bold" />
          </Fab>
        </Tooltip>
      )}
    </Stack>
  );

  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function scrollToBottom() { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }
}