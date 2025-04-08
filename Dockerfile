FROM ubuntu:24.04

# Locale
RUN apt-get update  \
    && apt-get install -y locales \
    && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

ENV LANG=en_US.utf8

## Install Python
ARG PYTHON_VERSION=2.7.9

### Install prerequisites
RUN apt-get update \
    && apt-get -y install \
        curl \
        openssl \
        build-essential \
    && apt-get clean

### Install compiled Python
RUN cd "/tmp" \
    && curl -O "https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz" \
    && tar xzf "Python-${PYTHON_VERSION}.tgz" \
    && cd "Python-${PYTHON_VERSION}" \
    && ./configure \
    && make \
    && make install \
    && cd "/tmp" \
    && rm -fr "Python-${PYTHON_VERSION}"

## Node.js

### Install prerequisites
RUN apt-get update \
    && apt-get -y --no-install-recommends install \
        openssh-client \
        git \
    && apt-get clean

### Install Yarn
RUN mkdir -p -m 755 /etc/apt/keyrings \
    && curl -fsSL "https://dl.yarnpkg.com/debian/pubkey.gpg" | gpg --dearmor -o "/etc/apt/keyrings/yarn.gpg" \
    && chmod 644 "/etc/apt/keyrings/yarn.gpg" \
    && echo 'deb [signed-by=/etc/apt/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main' | tee /etc/apt/sources.list.d/yarn.list \
    && chmod 644 /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        yarn \
    && apt-get clean

### Install Node.js via n
RUN curl -fsSL "https://raw.githubusercontent.com/tj/n/master/bin/n" | bash -s 8 \
    && npm install -g n

## Install ZAT (Zendesk Apps Tools)

### Install Ruby via rbenv
ARG RUBY_VERSION=2.7.1
ARG RBENV_INSTALL_PATH="/usr/local/rbenv"

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
      git curl autoconf bison build-essential libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm6 libgdbm-dev libdb-dev ruby-dev \
    && apt-get clean

RUN mkdir -p -m 755 ${RBENV_INSTALL_PATH} \
    && cd ${RBENV_INSTALL_PATH} \
    && git clone "https://github.com/rbenv/rbenv.git" . \
    && mkdir -p -m 755 "${RBENV_INSTALL_PATH}/plugins" \
    && git clone "https://github.com/rbenv/ruby-build.git" "${RBENV_INSTALL_PATH}/plugins/ruby-build" \
    && mkdir -p -m 755 "${RBENV_INSTALL_PATH}/cache"

SHELL ["/bin/bash", "-c"]
ENV PATH="${RBENV_INSTALL_PATH}/bin:${PATH}"
ENV RBENV_ROOT="/usr/local/rbenv-root"

RUN echo 'export PATH="${RBENV_INSTALL_PATH}/bin:${PATH}"' >> /home/ubuntu/.bashrc \
    && echo 'export PATH="${RBENV_INSTALL_PATH}/bin:${PATH}"' >> /root/.bashrc \
    && echo 'eval "$(rbenv init -)"' >> /home/ubuntu/.bashrc \
    && echo 'eval "$(rbenv init -)"' >> /root/.bashrc \
    && mkdir -p -m 755 "${RBENV_ROOT}/plugins" \
    && ln -s "${RBENV_INSTALL_PATH}/plugins/ruby-build" "${RBENV_ROOT}/plugins/ruby-build"

RUN rbenv install ${RUBY_VERSION} \
  && rbenv global ${RUBY_VERSION}

#### Install ZAT
RUN eval "$(rbenv init -)" \
    && gem install rake:13.0.1

RUN eval "$(rbenv init -)" \
    && gem install nokogiri:1.10.10

RUN eval "$(rbenv init -)" \
    && gem install ffi:1.13.1

RUN eval "$(rbenv init -)" \
    && gem install hitimes:2.0.0

RUN eval "$(rbenv init -)" \
    && gem install zendesk_apps_tools:3.8.0

# Run as non-root
USER "ubuntu"

WORKDIR "/app"

CMD ["bash"]
