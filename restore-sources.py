from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
for pet,item in json.loads((root/'source-manifest.json').read_text()).items():
 data=b''.join((root/name).read_bytes() for name in item['parts'])
 assert hashlib.sha256(data).hexdigest()==item['sha256'], 'Incomplete source: '+pet
 (root/(pet+'-blender-source.zip')).write_bytes(data)
 print('Restored',pet+'-blender-source.zip')
