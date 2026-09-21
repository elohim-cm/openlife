"use client";

import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/home.css";

function renderEmphasizedText(text, terms) {
  if (!text || !Array.isArray(terms) || terms.length === 0) return text;

  const escapedTerms = terms
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const normalizedTerms = terms.map(term => term.toLocaleLowerCase());

  return text.split(matcher).map((part, index) =>
    normalizedTerms.includes(part.toLocaleLowerCase())
      ? <strong key={`${part}-${index}`}>{part}</strong>
      : part
  );
}

export default function Privacy() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const items = t("privacyPage.items", { returnObjects: true });
  const privacyItems = Array.isArray(items) ? items : [];
  const terms = t("privacyPage.emphasisTerms", { returnObjects: true });
  const emphasisTerms = Array.isArray(terms) ? terms : [];

  const handleChange = panel => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box className="home-container privacy-container">
      <Header />

      <Box component="main" className="privacy-page-section" aria-labelledby="privacy-page-title">
        <Box className="privacy-background-glow" aria-hidden="true" />

        <Box className="privacy-content">
          <Box component="header" className="privacy-header">
            <Typography component="h1" id="privacy-page-title" className="privacy-title">
              {t("privacyPage.title")}
            </Typography>
            <Box className="privacy-title-mark" aria-hidden="true"><span /><span /></Box>
            <Typography component="p" className="privacy-subtitle">
              {t("privacyPage.subtitle")}
            </Typography>
          </Box>

          <Box className="privacy-accordions">
            {privacyItems.map((item, index) => {
              const panel = item.id || `privacy-${index}`;
              return (
                <Box
                  key={panel}
                  className="privacy-item-reveal"
                  style={{ "--faq-item-delay": `${Math.min(index * 45, 220)}ms` }}
                >
                  <Accordion
                    expanded={expanded === panel}
                    onChange={handleChange(panel)}
                    className="privacy-accordion"
                    disableGutters
                    elevation={0}
                    square={false}
                  >
                    <AccordionSummary
                      className="privacy-accordion-summary"
                      aria-controls={`${panel}-content`}
                      id={`${panel}-header`}
                      expandIcon={<span className="privacy-toggle-icon" aria-hidden="true"><span /><span /></span>}
                    >
                      <span className="privacy-number" aria-hidden="true">{index + 1}</span>
                      <Typography component="span" className="privacy-question">{item.title}</Typography>
                    </AccordionSummary>

                    <AccordionDetails className="privacy-answer-wrapper">
                      <Box className="privacy-legal-content">
                        {(Array.isArray(item.content) ? item.content : []).map((block, blockIndex) => {
                          if (block.type === "list") {
                            return <Box component="ul" key={blockIndex}>{block.items.map((entry, entryIndex) => <li key={entryIndex}>{renderEmphasizedText(entry, emphasisTerms)}</li>)}</Box>;
                          }
                          if (block.type === "email") {
                            return <a key={blockIndex} href={`mailto:${block.text}`}>{block.text}</a>;
                          }
                          return <Typography component="p" key={blockIndex}>{renderEmphasizedText(block.text, emphasisTerms)}</Typography>;
                        })}
                      </Box>
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
