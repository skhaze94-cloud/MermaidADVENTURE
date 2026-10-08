"""Export the complete game, readable source and shared assets as one offline HTML."""
from pathlib import Path
import base64, json, mimetypes, re, sys
root=Path(__file__).resolve().parents[1]/'dist'
out=Path(sys.argv[1])
assets={}
css_assets={}
def data(path):
    p=root/path
    mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
def inline_assets(text):
    return re.sub(r'([\"\'])((?:assets|fonts)/[^\"\']+)\1',lambda m:m[1]+data(m[2])+m[1],text)
def shared_asset(path):
    if path not in assets: assets[path]=data(path)
    return 'OFFLINE_ASSETS['+json.dumps(path)+']'
def script(m):
    name=m[1]
    code=(root/name).read_text()
    if name=='boss-v4.js':
        for n in ['boss-wild-parts','boss-sea-parts','boss-royal-parts','boss-spell-parts']:shared_asset('assets/'+n+'.webp')
        code=code.replace("'assets/'+name+'.webp'","OFFLINE_ASSETS['assets/'+name+'.webp']")
    code=re.sub(r'([\"\'])((?:assets|fonts)/[^\"\']+)\1',lambda m:shared_asset(m[2]),code)
    return '<script>\n/* Source: '+name+' */\n'+code.replace('</script','<\\/script')+'\n</script>'
def inline_css(text):
    def css_url(match):
        asset=match[1]
        shared_asset(asset)
        if asset not in css_assets: css_assets[asset]='--offline-art-'+str(len(css_assets))
        return 'var('+css_assets[asset]+')'
    text=re.sub(r"url\(['\"]?(assets/[^)'\"]+)['\"]?\)",css_url,text)
    return inline_assets(text)
html=(root/'index.html').read_text()
html=re.sub(r'<link\b[^>]*href=[\"\']([^\"\']+\.css)[\"\'][^>]*>',lambda m:'<style>\n/* '+m[1]+' */\n'+inline_css((root/m[1]).read_text())+'\n</style>',html)
html=inline_assets(html)
html=re.sub(r'<script src="([^"]+)"></script>',script,html)
html=html.replace('</head>','<script>const OFFLINE_ASSETS='+json.dumps(assets,separators=(',',':')).replace('</script','<\\/script')+';</script></head>')
if css_assets:
    setup='const OFFLINE_CSS='+json.dumps(css_assets)+';for(const [path,name] of Object.entries(OFFLINE_CSS))document.documentElement.style.setProperty(name,\"url(\"+JSON.stringify(OFFLINE_ASSETS[path])+\")\");'
    html=html.replace('</head>','<script>'+setup+'</script></head>')
assert not re.search(r'(?:src|href)=[\"\'](?:assets/|fonts/|[^\"\']+\.(?:js|css))',html)
out.write_text(html)
print(f'Exported {out.name}: {out.stat().st_size:,} bytes; {len(assets)} shared assets embedded once')
