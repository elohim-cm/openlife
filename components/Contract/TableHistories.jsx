import React from 'react';
import {
  Box,
  Tooltip, Button, Stack,
} from '@mui/material';

import MDBox from '@/material/components/MDBox';
import MUIDataTable from 'mui-datatables';
import textLabels from '@/utils/mui-data-tables/mui-data-tables-text-labels';
import ContractService from '@/services/ContractService';
import { useTranslation } from 'react-i18next';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import UtilMethods from "@/utils/UtilMethods";
import Link from "next/link";
import Routes from "@/utils/routes";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "@/styles/accountListing.module.scss";
import {FileDownload, PictureAsPdf} from "@mui/icons-material";

export default function TableHistories({ histories, setCurrentPage, pagination, onHandleDownloadContract, contractUid}) {
    const { t } = useTranslation();
    const [modalContent, setModalContent] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    const tableData = () =>
        histories?.map(history => {
            const _old = flattenObject(JSON.parse(history?.old_value))
                const _new = flattenObject(JSON.parse(history?.new_value))
            const {
                old_value,
                new_value
            } = findChangedKeys(_old, _new)
            console.log('old_value')
            /*console.log(_old)
            console.log('new_value')
            console.log(_new)*/
            return ({
                old_value: `${JSON.stringify(old_value)}`,
                new_value: `${JSON.stringify(new_value)}`,
                amendment: String(history?.amendment || '').toLowerCase(),
                access: `${history?.access?.account?.last_name} ${history?.access?.account?.first_name} (${history?.access?.role?.label})`,
                actions: (
                  <Stack direction="row" spacing={2}>
                    {history?.path && (
                      <Tooltip title={t("downloadAmendment")} style={{cursor:'pointer'}} placement="bottom">
                        <PictureAsPdf color="secondary" onClick={() => onHandleDownloadContract(history.uid)} />
                      </Tooltip>
                    )}
                  </Stack>
                ),
            })
        }) || [];

    const handleOpenModal = content => {
        setModalContent(JSON.parse(content));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalContent(null);
        setIsModalOpen(false);
    };

    const columns = ContractService.columns(t).filter(column => column.name !== 'download_limit').map(column => {
        if (column.name === 'old_value' || column.name === 'new_value') {
            return {
                ...column,
                options: {
                    customBodyRenderLite: dataIndex => {
                        const history = JSON.parse(tableData()[dataIndex][column.name] )|| {};
                        return (
                            <Tooltip title={t('seeMore')}>
                                <ul
                                    style={{
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        listStyleType:'none'
                                    }}
                                    onClick={() => handleOpenModal(tableData()[dataIndex][column.name])}
                                >
                                    {Object.keys(history).slice(0, 2).map((key, index) => {
                                        if (key.indexOf('uid') !== -1){
                                            return null
                                        }
                                        return <li key={index}>
                                            {history[key]}
                                        </li>
                                    })}
                                </ul>
                            </Tooltip>
                        );
                    },
                },
            };
        }
        return column;
    });

    const ModalComponent = ({ isOpen, onClose: handleClose, content }) => {

        const renderContent = (data, depth = 0) => {
            return Object?.entries(data ?? {})?.map(([key, value]) => {
                const renderedKey = `${UtilMethods.translation_correspondance(t)[key]}: `;
                if (key.indexOf('uid') !== -1)
                    return null
                const indentation = ' '.repeat(depth * 2);
                if (Array.isArray(value)) {
                    return (
                        <Box key={key}>
                            {/*{indentation}*/}
                            <strong>{UtilMethods.translation_correspondance(t)[key]}</strong>
                            <Box>
                                {'-'.repeat(24)}
                                {value.map((item, index) => (
                                    <Box key={index}>
                                        {renderContent(item, depth + 1)}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    );
                } else if (typeof value === 'object') {
                    return (
                        <Box key={key}>
                            {/*{indentation}*/}
                            <strong>{UtilMethods.translation_correspondance(t)[key]}</strong>
                            <Box>{renderContent(value, depth + 1)}</Box>
                        </Box>
                    );
                } else {
                    return (
                        <Box key={key}>
                            {/*{indentation}*/}
                            <strong>{renderedKey}</strong>
                            {value}
                        </Box>
                    );
                }
            });
        };

        return (
            <Dialog className='__dialog-container' style={{width: '100%!important'}} open={isOpen} onClose={handleClose}>
                <DialogTitle>{t('detail')}</DialogTitle>
                <DialogContent>
                    <Box>{renderContent(unflattenObject(content))}</Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="error" onClick={handleClose}>
                        {t("close")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <MDBox>
            <MUIDataTable
                title={t('contractModificationHistoryListing')}
                className="brMd"
                options={{
                    setTableProps: () => ({
                        size: 'medium',
                    }),
                    elevation: 1,
                    serverSide: true,
                    onChangePage: current_page => setCurrentPage(current_page + 1),
                    rowsPerPage: pagination?.per_page ? pagination?.per_page : 10,
                    count: pagination?.total ? pagination?.total : null,
                    textLabels,
                }}
                columns={columns}
                data={tableData()}
            />
            {isModalOpen && <ModalComponent isOpen={isModalOpen} onClose={handleCloseModal} content={modalContent} />}
        </MDBox>
    );
}
function flattenObject(obj, parentKey = '') {
    const flattenedObject = {};

    function flatten(obj, parentKey = '') {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const currentKey = parentKey ? `${parentKey}.${key}` : key;

                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    flatten(obj[key], currentKey);
                } else {
                    const updatedKey = updateKey(currentKey);
                    flattenedObject[updatedKey] = obj[key];
                }
            }
        }
    }

    function updateKey(key) {
        let updatedKey = key.replace(/\.person\./g, '.');

        updatedKey = updatedKey.replace(/\.subscribers\./g, '.subscriber.');
        updatedKey = updatedKey.replace(/\.death_beneficiaries\./g, '.death_beneficiary.');
        updatedKey = updatedKey.replace(/\.person_contacts\./g, '.person_contact.');
        updatedKey = updatedKey.replace(/\.life_beneficiaries\./g, '.life_beneficiary.');

        const matches = updatedKey.match(/^subscription\.(.+)$/);

        if (matches) {
            return matches[1].replace(/\.(\d+)\./g, '.0.');
        }

        return updatedKey;
    }

    flatten(obj, parentKey);
    return flattenedObject;
}

function findChangedKeys(obj1, obj2) {
    var changedKeys = [];
    var keysObj1 = Object.keys(obj1);
    var keysObj2 = Object.keys(obj2);

    for (let i = 0; i < keysObj1.length; i++) {
        let key = keysObj1[i];
        let values1 = !parseInt(JSON.stringify(obj1[key]))?JSON.stringify(obj1[key]): parseInt(JSON.stringify(obj1[key]))
        let values2 = !parseInt(JSON.stringify(obj2[key]))?JSON.stringify(obj2[key]): parseInt(JSON.stringify(obj2[key]))
        if (keysObj2.includes(key) && values1 !== values2) {
            changedKeys.push(key);
        }
        if (!keysObj2.includes(key)){
            changedKeys.push(key);
        }
    }

    let keysObj1Set1 = new Set(keysObj1)
    let keysObj1Set2 = new Set(keysObj2)

    let uniqueObj1Set1 = new Set([...keysObj1Set1].filter(x => !keysObj1Set2.has(x)));
    let uniqueObj1Set2 = new Set([...keysObj1Set2].filter(x => !keysObj1Set1.has(x)));

    let tab = [...uniqueObj1Set1, ...uniqueObj1Set2]
    changedKeys.push(...tab);

    const old_value = {}, new_value = {}

    changedKeys.forEach(key => {
        old_value[key] = obj1[key]
        new_value[key] = obj2[key]
    })

    return {
        old_value,
        new_value
    };
}

function unflattenObject(flatObject) {
    const unflatObject = {};

    for (const key in flatObject) {
        const keys = key.split('.');
        keys.reduce((acc, currentKey, index) => {
            const isArrayElement = /^\d+$/.test(keys[index + 1]);
            const isLastKey = index === keys.length - 1;

            if (isArrayElement) {
                acc[currentKey] = acc[currentKey] || [];
                if (isLastKey) {
                    acc[currentKey].push(flatObject[key]);
                }
            } else {
                acc[currentKey] = acc[currentKey] || {};
                if (isLastKey) {
                    acc[currentKey] = flatObject[key];
                }
            }
            return acc[currentKey];
        }, unflatObject);
    }

    console.log(unflatObject)
    return unflatObject;
}