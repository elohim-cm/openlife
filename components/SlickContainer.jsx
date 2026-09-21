import {Box} from "@mui/material";
import React from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SlickContainer = ({children}) => {

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        slideMargin: 20
    };

    return (
        <Box className="slider-container">
            <Slider {...settings}>
                {children}
            </Slider>
        </Box>
    );
};

export default SlickContainer;
