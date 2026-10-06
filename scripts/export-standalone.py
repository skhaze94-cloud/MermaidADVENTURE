"""Export the complete distributable as a single offline HTML with readable source."""
from pathlib import Path
import base64, mimetypes, re, sys
root=Path(__file__).resolve().parents[1]/'dist'
out=Path(sys.argv[1])
def data(path):
    p=root/path
    mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
def inline_assets(text):
    return re.sub(r'([\"\'])((?:assets|fonts)/[^\"\']+)\1',lambda m:m[1]+data(m[2])+m[1],text)
def script(m):
    name=m[1]
    code=(root/name).read_text()
    if name=='boss-v4.js':
        code=code.replace("'assets/'+name+'.webp'",'{'+','.join(repr(n)+':'+repr(data('assets/'+n+'.webp')) for n in ['boss-wild-parts','boss-sea-parts','boss-royal-parts','boss-spell-parts'])+'}[name]')
    code=inline_assets(code).replace('</script','<\\/script')
    return '<script>\n/* Source: '+name+' */\n'+code+'\n</script>'
html=(root/'index.html').read_text()
html=re.sub(r'<link\b[^>]*href=[\"\']([^\"\']+\.css)[\"\'][^>]*>',lambda m:'<style>\n/* '+m[1]+' */\n'+inline_assets((root/m[1]).read_text())+'\n</style>',html)
html=re.sub(r'<script src="([^"]+)"></script>',script,html)
html=inline_assets(html)
assert not re.search(r'(?:src|href)=[\"\'](?:assets/|fonts/|[^\"\']+\.(?:js|css))',html)
out.write_text(html)
print(f'Exported {out.name}: {out.stat().st_size:,} bytes')
