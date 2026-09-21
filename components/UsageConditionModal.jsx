"use client";

import React, {useRef, useState} from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

const UsageConditionModal = ({title, onConfirm, onCancel, onHandleSetIsBottom, isBottom}, ref) => {
  const [acceptCondition, setAcceptCondition] = useState(false);
  const [opened, setOpened] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const contentRef = useRef(null);
  const {t} = useTranslation();
  const translatedItems = t("privacyPage.items", {returnObjects: true});
  const terms = Array.isArray(translatedItems) ? translatedItems : [];

  React.useImperativeHandle(ref, () => ({
    open: () => setOpened(true),
    close: () => setOpened(false),
    toggleLoader: value => setInProgress(value),
  }));

  const handleScroll = () => {
    const content = contentRef.current;
    if (!content) return;

    const reachedBottom = content.scrollTop + content.clientHeight >= content.scrollHeight - 100;
    onHandleSetIsBottom(reachedBottom);
    if (!reachedBottom) setAcceptCondition(false);
  };

  const toggleAcceptance = () => setAcceptCondition(current => !current);

  return (
    <Dialog className="__positionned __usage-condition" open={opened} onClose={() => setOpened(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContent ref={contentRef} className="usage-condition-content" onScroll={handleScroll}>
          {terms.map((item, itemIndex) => (
            <article key={item.id || itemIndex}>
              <h5 style={{textDecoration: "underline"}}>{item.title}</h5>
              {(Array.isArray(item.content) ? item.content : []).map((block, blockIndex) => {
                if (block.type === "list") {
                  return (
                    <ul key={blockIndex}>
                      {(block.items || []).map((entry, entryIndex) => <li key={entryIndex}>{entry}</li>)}
                    </ul>
                  );
                }
                if (block.type === "email") {
                  return <a key={blockIndex} href={`mailto:${block.text}`}>{block.text}</a>;
                }
                return <p key={blockIndex}>{block.text}</p>;
              })}
            </article>
          ))}
        </DialogContent>
      </DialogContent>
      <DialogActions className="usage-condition-actions">
        {isBottom && (
          <Box sx={{display: "flex", alignItems: "center", cursor: "pointer"}} onClick={toggleAcceptance}>
            <Checkbox
              checked={acceptCondition}
              onChange={toggleAcceptance}
              name="accept_condition"
              inputProps={{"aria-label": t("acceptUsageConditions")}}
            />
            <Typography variant="body2">{t("accept")} {t("usageConditions")}*</Typography>
          </Box>
        )}
        <Stack direction={{sm: "column", md: "row"}} spacing={{xs: 1, sm: 2, md: 4}}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setOpened(false);
              onCancel();
            }}>
            {t("cancel")}
          </Button>
          <Button disabled={!acceptCondition} variant="contained" onClick={onConfirm} autoFocus sx={{ml: 1.5}}>
            {t("confirm")}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default React.forwardRef(UsageConditionModal);
