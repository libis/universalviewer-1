FROM ubuntu:16.04
# Install prerequisites

RUN apt-get update && apt-get install -y \
apache2 apache2-utils 
EXPOSE 80
CMD ["apache2ctl", "-D", "FOREGROUND"]


#
WORKDIR /tmp
	RUN cd /var/www/html/
	RUN mkdir universalviewer
	RUN cd universalviewer
	RUN mkdir uv
	RUN mkdir images	  

COPY index.html /var/www/html/universalviewer/
COPY uv /var/www/html/universalviewer/uv 
COPY uv-config.json /var/www/html/universalviewer
COPY images /var/www/html/universalviewer/images
