# RAT Scanner Limitations on GitHub Pages

## Client-Side Static Analysis Limitations

### What CAN be scanned client-side:

1. **JAR files** ✅
   - JAR files are ZIP archives
   - Can be extracted using JSZip library
   - Can analyze manifest files, class files (as binary), and resources
   - Can search for strings, URLs, and suspicious patterns

2. **ZIP archives** ✅
   - Can extract and recursively analyze contents
   - Can check for nested archives
   - Can analyze extracted files for patterns

3. **Text-based files** ✅
   - Scripts (JS, BAT, PS1, VBS, etc.)
   - Configuration files
   - XML, JSON, YAML
   - Can perform pattern matching and regex analysis

4. **Static binary analysis** ⚠️ (Limited)
   - Can extract strings from EXE/DLL files
   - Can search for patterns in binary data
   - Cannot execute or perform behavioral analysis

### What CANNOT be done client-side:

1. **EXE/DLL execution** ❌
   - Browser security prevents executing Windows binaries
   - No behavioral analysis possible
   - Cannot see what the file actually does when run

2. **Deep binary parsing** ❌
   - Limited ability to parse PE headers, sections, imports
   - Cannot analyze code structure or flow
   - Cannot detect packers/obfuscators reliably

3. **Network monitoring** ❌
   - Cannot monitor actual network traffic
   - Can only detect network indicators in static analysis
   - Cannot see C2 communication patterns

4. **File size limits** ⚠️
   - Browser memory constraints (typically 100-500MB practical limit)
   - Large files may cause browser crashes
   - GitHub Pages has no specific file size limit, but browser does

## Tria.ge API Integration

### What Tria.ge can do:
- **Full behavioral analysis** for supported file types
- **Network monitoring** during execution
- **Deep static analysis** of binaries
- **Sandbox execution** in isolated environment

### Supported file types for Tria.ge:
- Executables: DLL, EXE, MSI
- Archives: ZIP, JAR, 7z, RAR, etc.
- Scripts: BAT, PS1, JS, VBS, etc.
- Documents: PDF, Office files, HTML
- Mobile: APK, DEX (Android)
- Linux: ELF, SH

### Limitations:
- Requires API calls (rate limits may apply)
- Files are uploaded to Tria.ge servers
- Not suitable for sensitive/confidential files
- Requires internet connection

## Recommended Approach

### Client-Side Static Analysis (Fast, Private)
1. **JAR/ZIP extraction** - Use JSZip to extract and analyze
2. **String extraction** - Search for network indicators, suspicious strings
3. **Pattern matching** - Use regex to find C2 domains, IPs, ports
4. **Flag-based scoring** - Network, obfuscation, system flags

### Tria.ge API (Deep Analysis)
1. **Optional submission** - For files that pass initial checks
2. **Behavioral analysis** - See actual network activity
3. **Verification** - Confirm suspicious findings

## File Type Recommendations

**Best for client-side scanning:**
- JAR files (can fully extract and analyze)
- ZIP archives (can extract and analyze contents)
- Script files (can read and analyze code)
- Text-based configs

**Limited client-side scanning:**
- EXE/DLL (string extraction only, no execution)
- APK (can extract but limited analysis)
- Packed/obfuscated files (harder to analyze)

**Requires Tria.ge for full analysis:**
- Executables needing behavioral analysis
- Files with heavy obfuscation
- Suspicious files needing verification
