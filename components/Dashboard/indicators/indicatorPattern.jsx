import Grid from "@mui/material/Unstable_Grid2";
import {Box, Button, Tooltip, Typography} from "@mui/material";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {formatNumberStr, getLanguage} from "@/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useTranslation} from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Slider from "react-slick";
import {toJpeg} from "html-to-image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {SlickNextArrow, SlickPrevArrow} from "@/components/Slick/SlickArrows";
import moment from "moment/moment";
import SaveAltIcon from '@mui/icons-material/SaveAlt';

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function IndicatorPattern({card, donut, area, compareCheckbox, sum, filterAreaChart, filterReady}) {
  const { t } = useTranslation();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    slideMargin: 20,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    nextArrow: <SlickNextArrow />,
    prevArrow: <SlickPrevArrow />
  };

// Custom card component with icons
  const StatCard = ({ title, value, type, color, link }) => (
    <Tooltip title={title + ': ' + value} placement="top">
      <Box
        sx={{
          p: 2,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${bgColor(color)} 0%, ${bgColor(color)}dd 100%)`,
          boxShadow: `0 2px 7px -2px ${shadowColor(color)}`,
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: `0 7px 12px -7px ${shadowColor(color)}`,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ grow: '1', maxWidth: 'calc(100% - 46px)' }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "0.875rem",
                fontWeight: 500,
                mb: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textTransform: 'capitalize'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {value}
            </Typography>
          </Box>
          {
            type &&
            <Box
              sx={{
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "12px",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {renderIcon(type)}
            </Box>
          }
        </Box>

        {
          link &&
          <Grid sx={{p:0, position: 'relative', zIndex: 2, mt:1, justifySelf: 'end'}}>
            <Link href={link}>
              <Typography sx={{
                fontSize: "0.875rem",
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}>
                {t('seeMore').slice(0, -3)}
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#fff"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>
              </Typography>
            </Link>
          </Grid>
        }

        <Box
          sx={{
            position: "absolute",
            bottom: "-20px",
            right: "-20px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "-15px",
            left: "-15px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
      </Box>
    </Tooltip>
  );

// Colors for cards
  const bgColor= (type)=>{
    switch (type) {
      case "gray":
        return "#a1a5ab";
      case "green":
        return "#4CAF50";
      case "orange":
        return "#FF9800";
      case "red":
        return "#F44336";
      case "blue":
        return "#2196F3";
      case "cyan":
        return "#00BCD4";
      case "violet":
        return "#9C27B0";
      case "green2":
        return "#CDDC39";
      default:
        return type;
    }
  }

  const shadowColor= (type)=>{
    switch (type) {
      case "gray":
        return "#6b6e73";
      case "green":
        return "rgba(76, 175, 80, 0.4)";
      case "orange":
        return "rgba(255, 152, 0, 0.4)";
      case "red":
        return "rgba(244, 67, 54, 0.4)";
      case "blue":
        return "rgba(33, 150, 243, 0.4)";
      case "cyan":
        return "#00BCD444";
      case "violet":
        return "#9C27B044";
      case "green2":
        return "#CDDC3944";
      default:
        return type;
    }
  }

// Icons for cards
  const renderIcon = (type) => {
    switch (type) {
      case "validated":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case "creation":
      case "confirmation":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        );
      case "processing":
      case "approval":
      case "acceptance":
      case "validation":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        );
      case "rejected":
      case "cancelled":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case "total":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      case 'active':
        return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
      case 'suspended':
        return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>;
      case 'draft':
        return <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="rgba(255,255,255,0.85)"><path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>;
      case 'payment':
        return <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="rgba(255,255,255,0.85)"><path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z"/></svg>
      case 'inactive':
        return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
      default:
        return null;
    }
  };

// Format colorName to #Colors dor Donut chart
  const formatColor= (colors)=>{
    if(colors.length < 1) return colors;

    let newColor= [];
    for(let i=0; i<colors.length; i++){
     newColor.push(bgColor(colors[i]));
    }

    return newColor;
  }

  // Donut chart for current status distribution
  const statusDonutOptions = donut
    ? {
        chart: {
          type: "donut",
          height: 400,
          fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
        },
        grid: {
          padding: {
            bottom: -30,
          },
        },
        labels: donut.labels,
        colors: formatColor(donut.colors),
        title: {
          text: donut.title,
          align: "center",
          style: {
            fontSize: "18px",
            fontWeight: 600,
            fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: "14px",
                  fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
                  fontWeight: 600,
                },
                value: {
                  show: true,
                  fontSize: "22px",
                  fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
                  fontWeight: 700,
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: "Total",
                  fontSize: "16px",
                  fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
                  fontWeight: 600,
                  color: "#373d3f",
                },
              },
            },
          },
        },
        legend: {
          show: true,
          position: "top",
          fontSize: "14px",
          fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
          markers: {
            width: 12,
            height: 12,
            radius: 6,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {width: "100%"},
              legend: {position: "top"},
              grid: {
                padding: {
                  bottom: -50,
                },
              },
            },
          },
          {
            breakpoint: 769,
            options: {
              chart: {width: "100%"},
              legend: {position: "top"},
              grid: {
                padding: {
                  bottom: -10,
                },
              },
            },
          },
        ],
        tooltip: {
          style: {
            fontSize: "14px",
            fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
          },
        },
      }
    : "";

  const getFormat= (granularity, apex=false)=>{
    switch (granularity) {
      case "MONTHLY":
        return 'MMM yyyy';
      case "DAILY":
        return 'DD MMM';
      case "YEARLY":
        return 'yyyy';
    }
  }
  // Success rate area chart
  const successRateAreaOptions = useMemo(()=>area ? {
    chart: {
      height: 400,
      type: "area",
      zoom: {
        enabled: false,
      },
      toolbar: {show: false},
      fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
    },
    colors: area.colors,
    dataLabels: {enabled: false},
    stroke: {curve: "smooth", width: 2},
    xaxis: {
      type: "category",
      tickAmount: 12,
      labels: {
        show: true,
        style: {fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif'},
        formatter: val => `${moment(val).format(getFormat(area.granularity))}`,
      },
    },
    yaxis: {
      title: {
        text: area.yTitle + " (FCFA)",
        style: {fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif'},
      },
      labels: {
        style: {fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif'},
        formatter: function (val) {
          return formatNumberStr(val, getLanguage(), '', true);
        },
      },
      min: 0,
    },
    tooltip: {
      style: {fontSize: "14px", fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif'},
      y:{formatter: val => `${formatNumberStr(val, getLanguage())}`}
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: area.compare ? 0.3 : 0.7,
        opacityTo: area.compare ? 0.5 : 0.9,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {width: '100%'},
        },
      },
    ],
  } : {},[area]);

  const divRef= useRef(null);
  // For exporting Status block to JPG
  const handleExport= async ()=>{
    if(!divRef.current) return

    try{
      const dataUrl= await toJpeg(divRef.current, {quality: 1});

      const link= document.createElement('a');
      link.download = card.name+'Indicator_'+moment(new Date()).format("YYYYMMDD_HHmmss")+'.jpeg';
      link.href = dataUrl;
      link.click();
    }catch (error){
      console.error('Error export JPEG', error);
    }
  }

  return (
    <div
      ref={divRef}
      style={{
        backgroundColor: "#fff",
        padding: "12px",
        borderRadius: "16px",
      }}>
      <Typography
        variant="h6"
        component="h6"
        mb={1}
        sx={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#2d3748",
          borderBottom: "1px solid #edf2f7",
        }}>
        <Grid sx={{display: "flex", justifyContent: "space-between", alignItems:'center'}}>
          <Box sx={{}}>{card.name}</Box>

          <Box sx={{cursor:'pointer', height:'20px', "&:hover":{color:shadowColor('green')}, color:bgColor('green'), display: 'flex', flexDirection: 'row', alignItems:'center'}} onClick={handleExport}>
            <Typography sx={{fontSize:'1rem', mr:1}}>{t('export')}</Typography>
            <SaveAltIcon sx={{fontSize:'1rem'}}/>
          </Box>
        </Grid>
      </Typography>

      <Grid container spacing={3} sx={{position:'relative'}}>
        {
          //Loader when filter is ready
          filterAreaChart && !filterReady &&
          <Box sx={{p:0.5, zIndex: 2, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent:'center', top: 0, height:'100%', width:'100%'}}>
            <Box sx={{p: 3, borderRadius: '12px', backgroundColor: '#00000022', display: 'flex', alignItems: 'center', justifyContent:'center',height:'300px', width:'300px'}}>
              <CircularProgress />
            </Box>
          </Box>
        }
        {filterAreaChart &&
          <>
            {filterAreaChart}
          </>
        }
        {/* Summary cards */}
        <Grid container xs={12} spacing={3} sx={{p: 0, m:0}}>
          {
            card.data.title.length > 4 && (
              <Box className="slider-container custom-slick-buttons" sx={{p:1,pt:0.5}}>
                <Slider {...settings} sx={{}}>
                  {card.data.title.map((title, index) => (
                    <Box key={index} sx={{m:1}}>
                      <StatCard
                        title={title}
                        value={card.data.value[index]}
                        type={card.data.type[index]}
                        color={card.data.color[index]}
                        link={card.link ? card.link[index] : null}
                      />
                    </Box>
                  ))}
                </Slider>
              </Box>
            )
          }
          {card.data.title.length <= 4 && card.data.title.map((title, index) => (
            <Grid key={index} xs={12} md={6} lg={3}>
              <StatCard
                title={title}
                value={card.data.value[index]}
                type={card.data.type[index]}
                color={card.data.color[index]}
                link={card.link ? card.link[index] : null}
              />
            </Grid>
          ))}

        </Grid>
        {
          donut ?
            <Grid xs={12} md={12} lg={4}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                }}>
                <ReactApexChart options={statusDonutOptions} series={donut.series} type="donut" height={400} width="100%" />
              </Box>
              {
                sum ?
                  <Grid sx={{width: {xs: '100%', md:'50%', lg:'100%'}}}>
                    <StatCard
                      title={sum.title}
                      value={sum.value}
                      color={'green'}
                    />
                  </Grid>
                  : null
              }
            </Grid>
            : null
        }
        {
          area ?
            <Grid sx={{position:'relative'}} xs={12}  md={12} lg={8}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                }}>
                <Box sx={{display:'flex',flexDirection:{xs: 'column', md:'row'}, justifyContent:'center', alignItems: 'center', gap:{xs:0, md:5}}}>
                  <Typography variant='h6' fontWeight={600} fontSize='18px' fontFamily='"Poppins", "Roboto", "Helvetica", sans-serif'>{area.title}</Typography>
                  <box>{compareCheckbox}</box>
                </Box>
                <ReactApexChart
                  options={successRateAreaOptions}
                  series={area.series}
                  type="area"
                  height={400}
                  width="100%"
                />
              </Box>
            </Grid>
            : null
        }
      </Grid>
    </div>
  );
}