### 0.0.12 (SNAPSHOT)
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
# Add mock#fs createWriteStream
# Add mock#process on
# Remove {now()} template function from text#apply, more appropriate location in the userland
# Add text#applyPrecompiled
# Add text#compile

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
