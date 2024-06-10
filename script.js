document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-btn");
  const fileInput = document.getElementById("file-input");
  const detectBtn = document.getElementById("detect-btn");
  const resetBtn = document.getElementById("reset-btn");
  const imageContainer = document.getElementById("image-container");
  const detectionContainer = document.getElementById("detection-container");
  const chartCanvas = document.getElementById("chart");
  let imageElement;
  let chart;

  // Upload button event
  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // Handle file input change
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageContainer.innerHTML = `<img id="uploaded-image" src="${e.target.result}" alt="Uploaded Image"/>`;
        imageElement = document.getElementById("uploaded-image");
        detectionContainer.innerHTML = ""; // Clear previous detection
        if (chart) {
          chart.destroy(); // Destroy previous chart if exists
        }
        createChart(); // Create a new chart
      };
      reader.readAsDataURL(file);
    }
  });

  // Detect button event
  detectBtn.addEventListener("click", () => {
    if (imageElement) {
      detectionContainer.innerHTML = `<canvas id="canvas"></canvas>`;
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const modelPromise = cocoSsd.load();
      modelPromise.then((model) => {
        model.detect(imageElement).then((predictions) => {
          canvas.width = imageElement.width;
          canvas.height = imageElement.height;
          ctx.drawImage(imageElement, 0, 0);
          drawPredictions(predictions, ctx);
          updateChart(predictions);
        });
      });
    }
  });

  // Reset button event
  resetBtn.addEventListener("click", () => {
    imageContainer.innerHTML = "";
    detectionContainer.innerHTML = "";
    fileInput.value = "";
    detectBtn.disabled = true; // Deactivate Detect button
    if (chart) {
      chart.destroy(); // Destroy the chart
    }
  });

  function drawPredictions(predictions, ctx) {
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "18px Arial";
      ctx.fillStyle = "#00FFFF";
      ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);
    });
  }

  function createChart() {
    chart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Detected Objects",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            hoverBorderColor: "orange",
            borderWidth: 1,
            data: [],
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          datalabels: {
            display: true,
            color: "#F00000",
            anchor: "end",
            align: "top",
            formatter: (value, context) => {
              return value > 0 ? value : "";
            },
          },
        },
      },
    });
  }

  function updateChart(predictions) {
    const counts = {};
    predictions.forEach((prediction) => {
      counts[prediction.class] = (counts[prediction.class] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = labels.map((label) => counts[label]);
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
});
