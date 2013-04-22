### 0.1.6-pre
*

### 0.1.5
* Add http#req timeout handling, default timeout changed to 2000 milliseconds

### 0.1.4
* Add http#req headers, payload (body, form, json, multipart), and requestOpts handling

### 0.1.3
* Add http#req wildcard status code handling, e.g. 20x, 3xx
* Add http#req param followAllRedirects: true to follow non-GET redirection

### 0.1.2
* http#proxy now handles HTTP_PROXY and HTTPS_PROXY along with http_proxy and https_proxy environment variables

### 0.1.1
* Add http#proxy, modify http#request to use environment variable proxy when not specified in opts

### 0.1.0
* Remove mock since sandoxed-module is no longer actively maintained
* Combine cli#readConfigFileSync and cli#readCustomConfigFileSync into cli#lookupFile
* Remove cli#parse (already replaced by cli#command in 0.0.16)
* Remove cli#readFiles, async read files is slower than sync for small number of files
* Remove irc#Bot, too specific

### 0.0.17
* Add irc#Bot

### 0.0.16
* Add mock#fs exists and readFile
* Add cli#readFiles
* Add http#request
* Add cli#command

### 0.0.15
* Add mock#fs existsSync and writeFile

### 0.0.14
* Add mock#fs writeFileSync

### 0.0.13
* Add cli#spawn
* Add mock#spawn

### 0.0.12
* Add global cli options.
* Add cli#readCustomConfigFileSync

### 0.0.11
* Add mock#process nextTick and stdout

### 0.0.10
* Set max node engine to < 0.9.0 

### 0.0.9
* Modify mock#stream write to return status

### 0.0.8
* Add mock#stream 
* Add mock#fs createWriteStream
* Add mock#process on
* Remove {now()} template function from text#apply, more appropriate location in the userland
* Add text#applyPrecompiled
* Add text#compile

### 0.0.7
* Add mock#childProcess fork
* Add mock#process pid

### 0.0.6
* Fix cli#parse option argument handling
* Add cli#parse option action callback

### 0.0.5
* Add mock request

### 0.0.4
* Mock console error and log now simulates %s, %d, %j

### 0.0.3
* Modify cli readConfigFileSync, config file in current directory should take precedence over the one in home directory

### 0.0.2
* Add mock http request and response
* Add mock process platform
* Add Windows support for cli readConfigFileSync, should identify home directory properly now 

### 0.0.1
* Initial version
