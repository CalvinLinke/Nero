import json,sys
d=json.load(sys.stdin)
for coin in d:
  x=d[coin]; print("=====", coin, x['ts'])
  for s in x['signals']['spannung']: print('S', s['id'], s['status'], s['score'], s.get('percentile'), s['values'], '|', s['text'][:110])
  for s in x['signals']['neigung']: print('N', s['id'], s['status'], s['tilt'], s['values'], '|', s['text'][:110])
  print('PEGEL', json.dumps(x['pegel']))
  c=x['context']
  for k in ['preis','optionen','positionierung','makro','etf','termine','quellenFehler']: print(k.upper(), json.dumps(c[k], ensure_ascii=False)[:900])
