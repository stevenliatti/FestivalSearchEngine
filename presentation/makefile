CC=xelatex -shell-escape
MAIN=presentation

all: $(MAIN).pdf mostlyclean

$(MAIN).pdf: $(MAIN).tex images/*
	$(CC) $(MAIN).tex
	$(CC) $(MAIN).tex

mostlyclean:
	rm -rf _minted-presentation *.log *.aux *.toc *.bbl *.blg *.out *.lof *.nav *.snm *.vrb

clean:
	rm -rf $(MAIN).pdf _minted-presentation *.log *.aux *.toc *.bbl *.blg *.out *.lof *.nav *.snm *.vrb

rebuild: clean all
