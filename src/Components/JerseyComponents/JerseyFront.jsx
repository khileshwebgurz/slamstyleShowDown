import React, { useRef, useEffect } from "react";
import JerseyCustomisableData from "../../utils/jerseyCustomisableData.js";
const JerseyFront = ({
  selectedNeckImage,
  selectedShoulderImage,
  shapeColors,
}) => {

  
  const canvasRef = useRef(null);

  let shirtImage = ``;

  // getting the value of selectedJersey from local storage
  const jersyNum = localStorage.getItem("selectedJersy");

  // conditionally getting the jersey based on narrow or wide
  if (selectedShoulderImage.includes("narrow")) {
    shirtImage = `assets/jerseys/${jersyNum}/slicings/crew_front_narrow_shoulder.png`;
  } else {
    shirtImage = `assets/jerseys/${jersyNum}/slicings/crew_front_wide_shoulder.png`;
  }

  // using bg image of shirt to make it visible 
  const shirtBg = `assets/jerseys/${jersyNum}/slicings/crew_front_narrow_shoulderbg.png`;

  // getting all the stripes based on uniform layers
  const stripesNum = JerseyCustomisableData[jersyNum].uniform_layers;

  // intially specifying frontstripe
  const frontStripes = `assets/jerseys/${jersyNum}/slicings/front-stripes.png`;

  // storing all the stripes in the stripeImages array
  const stripeImages = [];
  for (let i = 2; i <= stripesNum - 2; i++) {
    stripeImages.push(
      `assets/jerseys/${jersyNum}/slicings/front-stripes-${i}.png`
    );
  }


  // loading all the images before using it
  const loadImages = async (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (error) => {
        console.error("Image loading failed:", img);
        reject(error);
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    const drawImages = async () => {
      try {
        const [
          shirt,
          shoulderImg,
          frontStripesImg,
          selectedImg,
          shirtbg,
          ...additionalStripes
        ] = await Promise.all([
          loadImages(shirtImage),
          loadImages(selectedShoulderImage),
          loadImages(frontStripes),
          loadImages(selectedNeckImage),
          loadImages(shirtBg),
          // loading all the images one by one from the stripeImages array
          ...stripeImages.map((src) => loadImages(src)),
        ]);

        
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw shirt
        context.drawImage(shirt, 10, 30, 300, 600);
        let imageData = context.getImageData(10, 30, 300, 600);
        imageData = changeColor(imageData, shapeColors.shirt1);
        context.putImageData(imageData, 10, 30);

        // background image
        context.drawImage(shirtbg, 10, 30, 300, 600);

        // Draw other images
        const images1 = [
          {
            image: shoulderImg,
            color: shapeColors.shoulder1,
            position: [10, 30],
          },
          {
            image: frontStripesImg,
            color: shapeColors.shirt2,
            position: [10, 30],
          },
        ];

        // now adding all the additional stripes to my Images array so that it can used inside
        // the temporary canvas
        additionalStripes.forEach((stripeImg, index) => {
          // starting with 3 bcz we already have base image and 1 stripe
          const colorKey = `shirt${index + 3}`;
          images1.push({
            image: stripeImg,
            color: shapeColors[colorKey],
            position: [10, 30],
          });
        });


        // temp canvas for the neck options
        if (selectedNeckImage) {
          const tempCanvasbackStr = document.createElement("canvas");
          tempCanvasbackStr.width = 175;
          tempCanvasbackStr.height = 120;
          const textContextbackStr = tempCanvasbackStr.getContext("2d");
          textContextbackStr.drawImage(selectedImg, -8, -3, 175, 120);
          const tempImagebackStr = textContextbackStr.getImageData(
            -8,
            -3,
            175,
            120
          );
          const updatedTempImagebackStr = changeColor(
            tempImagebackStr,
            shapeColors.neck1
          );
          textContextbackStr.putImageData(updatedTempImagebackStr, -8, -3);
          context.drawImage(tempCanvasbackStr, 80, 30);
        }

        // now putting images in temp canvas and then putting it over original
        images1.forEach(({ image, color, position }) => {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 300;
          tempCanvas.height = 600;
          const tempContext = tempCanvas.getContext("2d");
          tempContext.drawImage(image, 0, 0, 300, 600);
          let tempImageData = tempContext.getImageData(0, 0, 300, 600);
          tempImageData = changeColor(tempImageData, color);
          tempContext.putImageData(tempImageData, 0, 0);
          context.drawImage(tempCanvas, ...position);
        });
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    drawImages();
  }, [selectedNeckImage, selectedShoulderImage, shapeColors]);


  // function for changing the color of the component of the jersey
  const changeColor = (imageData, color) => {
    if (!color) {
      console.error("Color is undefined or null.");
      return imageData;
    }
    const { data } = imageData;
    const hexColor = color.replace(/^#/, "");
    const [r, g, b] = hexColor.match(/.{1,2}/g).map((c) => parseInt(c, 16));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    return imageData;
  };
  return <canvas ref={canvasRef} width={300} height={600} />;
};

export default JerseyFront;
