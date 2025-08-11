# ℹ️ Comment compiler le rapport de stage LaTeX pour générer un pdf

## Avec TeX Live

1️⃣ Prérequis : 

- Latex :\
    Windows : [TeX Live](https://tug.org/texlive/acquire-netinstall.html)\
    Mac : [TeX Live](https://tug.org/mactex)\
    Linux : 
    ```bash
        sudo apt update
        sudo apt install texlive-latex-extra

2️⃣ Compiler :

- Ouvrir un terminal dans le dossier contenant le .tex : 
    ```bash
        pdflatex rapport_stage.tex
        pdflatex rapport_stage.tex
Exécuter la commande 2 fois pour générer la tables des matières

- Lire : 
    ```bash 
    xdg-open rapport_stage.pdf


