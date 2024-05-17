import React, { useRef, useEffect } from "react";

const JerseyRight = ({ selectedvorNovImg,shapeColors }) => {
  const jersyNum = localStorage.getItem("selectedJersy");
  const rightsideStripes = `assets/jerseys/${jersyNum}/slicings/rightside-stripes.png`;
  const rightsideShoulder = `assets/jerseys/${jersyNum}/slicings/rightside-shoulder.png`;
  const rightsideCollar = `assets/jerseys/${jersyNum}/slicings/rightside-collar.png`;

  let shirtImagebg = ``;

  if (selectedvorNovImg.includes('crew_rightside')) {
    shirtImagebg = `assets/jerseys/${jersyNum}/slicings/crew_rightsidebg.png`;
  } else {
    shirtImagebg = `assets/jerseys/${jersyNum}/slicings/crew_noV_rightsidebg.png`;
  }

  const canvasRef = useRef(null);
  console.log(selectedvorNovImg);
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
        const [rightImg, rightSideStripesImg, rightSideShoulderImg, rightSideCollarImg, shirtImgBg] =
          await Promise.all([
            loadImages(selectedvorNovImg),
            loadImages(rightsideStripes),
            loadImages(rightsideShoulder),
            loadImages(rightsideCollar),
            loadImages(shirtImagebg)
          ]);

        context.clearRect(0, 0, canvas.width, canvas.height);

        // default shirt
        context.drawImage(rightImg, 10, 0, 300, 600);
        let imageData = context.getImageData(10, 0, 300, 600);
        imageData = changeColor(imageData, shapeColors.shirt1);
        context.putImageData(imageData, 10, 0);

        

        // Draw other default images
        const defaultImages = [
          {
            image: rightSideStripesImg,
            color: shapeColors.shirt2,
            position: [10, 0],
          },
          {
            image: rightSideCollarImg,
            color: shapeColors.neck1,
            position:[10,0],
          },

          {
            image: rightSideShoulderImg,
            color: shapeColors.shoulder1,
            position: [10, 0],
          },
        ];

        defaultImages.forEach(({ image,color, position }) => {
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

        context.drawImage(shirtImgBg,10,0,300,600)
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    drawImages();
  }, [selectedvorNovImg,shapeColors]);

  const changeColor = (imageData, color) => {
    const { data } = imageData;
    const hexColor = color.replace(/^#/, ""); // Remove '#' if present
    const [r, g, b] = hexColor.match(/.{1,2}/g).map((c) => parseInt(c, 16));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    return imageData;
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={600}
      
    />
  );
};

export default JerseyRight;
