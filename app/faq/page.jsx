"use client";

import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/home.css";

export default function Faq() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const items = t("faqPage.items", { returnObjects: true });
  const faqItems = Array.isArray(items) ? items : [];

  const handleChange = panel => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box className="home-container faq-container">
      <Header />

      <Box component="main" className="faq-page-section" aria-labelledby="faq-page-title">
        <Box className="faq-background-glow" aria-hidden="true" />

        <Box className="faq-content">
          <Box component="header" className="faq-header">
            <Typography component="h1" id="faq-page-title" className="faq-title">
              {t("faqPage.title")}
            </Typography>
            <Box className="faq-title-mark" aria-hidden="true">
              <span />
              <span />
            </Box>
            <Typography component="p" className="faq-subtitle">
              {t("faqPage.subtitle")}
            </Typography>
          </Box>

          <Box className="faq-accordions">
            {faqItems.map((item, index) => {
              const panel = item.id || `faq-${index}`;
              const isOpen = expanded === panel;

              return (
                <Box
                  key={panel}
                  className="faq-item-reveal"
                  style={{ "--faq-item-delay": `${Math.min(index * 45, 220)}ms` }}
                >
                  <Accordion
                    expanded={isOpen}
                    onChange={handleChange(panel)}
                    className="faq-accordion"
                    disableGutters
                    elevation={0}
                    square={false}
                  >
                  <AccordionSummary
                    className="faq-accordion-summary"
                    aria-controls={`${panel}-content`}
                    id={`${panel}-header`}
                    expandIcon={
                      <span className="faq-toggle-icon" aria-hidden="true">
                        <span />
                        <span />
                      </span>
                    }
                  >
                    <span className="faq-number" aria-hidden="true">{index + 1}</span>
                    <Typography component="span" className="faq-question">
                      {item.question}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails id={`${panel}-content`} className="faq-answer-wrapper">
                    <Typography component="p" className="faq-answer">
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                  </Accordion>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Footer variant="detailed" />
    </Box>
  );
}
