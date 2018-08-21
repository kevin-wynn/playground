FROM git.homeadvisor.com:4567/tonym/ha-docker-centos:latest

MAINTAINER "<%= author %>" <kevin.wynn@homeadvisor.com>

RUN yum -y update; yum clean all 
RUN yum -y install epel-release; yum clean all 
RUN rpm -i https://kojipkgs.fedoraproject.org/packages/http-parser/2.7.1/3.el7/x86_64/http-parser-2.7.1-3.el7.x86_64.rpm
RUN yum -y install make gcc gcc-c++ nodejs npm git; yum clean all

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

ADD README.md /usr/src/app

RUN npm set registry http://npm.1800c.xyz

# RUN npm config set @cypress:registry https://registry.npmjs.org/
# RUN npm config set @types:registry https://registry.npmjs.org

RUN npm i

# RUN npm install -g grunt-cli

COPY . /usr/src/app

EXPOSE 3000

CMD [ "node", "index.js" ]