#  Tree Species Recognition System

A mobile-based deep learning system for automated tree species identification from terrestrial RGB images.

##  About

This project develops a **Progressive Web Application (PWA)** capable of identifying tree species in real time using a photo taken by the user. The system leverages the **Xception** pre-trained convolutional neural network (CNN), processed locally on the device via a **TinyML** approach — no specialized hardware required.

The app captures an image, preprocesses it (resizing to 256×256 px, format normalization, basic enhancement), runs it through the classification model, and immediately displays the predicted species along with a confidence score and, when available, the photo's geolocation.

##  Model

| Metric | Xception (pre-trained) | CNN from scratch |
|---|---|---|
| Training Accuracy | 99% | <60% |
| Validation Accuracy | **83%** | 51% |
| Training Time | ~45 min | ~90 min |

The Xception model was fine-tuned on a dataset of **23 tree species** from Massachusetts, USA, sourced from [this Kaggle notebook](https://www.kaggle.com/code/fatmaezzathassan/tree-species-classification-finall/notebook).

##  Features

-  Real-time species classification from camera photos
-  Georeferenced capture logging (when available)
-  Cross-platform PWA — works on iPhone and Android
-  On-device inference (TinyML) — no data sent to servers
-  Result history stored locally on the device

##  Limitations

- Only recognizes the **23 species** present in the training dataset
- Dataset covers a **single geographic region** (Massachusetts, USA) and a **single season** — tropical species (e.g., Costa Rica) may produce false positives
- PWA deployment on iOS requires an internet connection and a running local server
- Performance degrades with blurry, overexposed, or heavily obstructed images

##  Repository Structure

```
├── model/              # Trained Xception model (TFLite / converted format)
├── app/                # PWA source code (HTML, JS, CSS)
├── preprocessing/      # Image normalization and augmentation scripts
├── training/           # Kaggle training notebooks and scripts
└── docs/               # Project report and diagrams
```

##  Tech Stack

- **Deep Learning:** TensorFlow / Keras — Xception architecture
- **Mobile Deployment:** TensorFlow Lite (TinyML)
- **Frontend:** Progressive Web App (PWA)
- **Training Platform:** Kaggle

##  Dataset

The dataset was obtained from Kaggle:
> Fatma Ezzat Hassan. *Tree Species Classification*. Kaggle, 2023.
> https://www.kaggle.com/code/fatmaezzathassan/tree-species-classification-finall/notebook

##  Authors

- **Max Garro-Mora** — [@Maxg2212](https://github.com/Maxg2212)
- **Luis Chavarria-Zamora**
- **Luis Alonso Barboza-Artavia** *(reviewer)*
- **Jason Leitón-Jiménez** *(reviewer)*

*Escuela de Ingeniería en Computadores — Instituto Tecnológico de Costa Rica*

##  Acknowledgments

This work was partially funded by *Vicerrectoría de Investigación y Extensión* from *Instituto Tecnológico de Costa Rica* (Research #1440054).

##  License

This project is developed for academic purposes at Instituto Tecnológico de Costa Rica.
