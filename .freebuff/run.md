# NutriVerify Frontend Preview

## How to Reproduce Artifacts

Dependencies are already installed (`frontend/node_modules` exists). If starting fresh:

```bash
cd frontend
npm install
```

No `.env.local` needed — the Vite config proxies `/api` to `http://localhost:8080` by default.

## How to Run the Server

Start the Vite dev server on port 5173 using `node.exe` directly (not `npm run dev` via shell scripts, which fail on Windows):

```powershell
Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList 'C:\Users\dhurg\Desktop\NutriVerify\frontend\node_modules\vite\bin\vite.js','--port','5173' -WorkingDirectory 'C:\Users\dhurg\Desktop\NutriVerify\frontend' -RedirectStandardOutput 'C:\Users\dhurg\Desktop\NutriVerify\.freebuff\preview-c52c13a9-ebb7-4717-9966-36184d20d5f0.log' -RedirectStandardError 'C:\Users\dhurg\Desktop\NutriVerify\.freebuff\preview-c52c13a9-ebb7-4717-9966-36184d20d5f0.log.err' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id
```

If port 5173 is occupied, use `--port <free-port>` and update the Vite config proxy target accordingly.

## Operational Notes

- The `Start-Process ... | Select-Object -ExpandProperty Id` form may hang the calling shell (it can time out after ~25s), but the spawned vite process survives. After a timeout, don't blindly retry — check `netstat -ano | grep ":5173" | grep LISTEN` first; the server is usually already up.
- Confirm the server serves NutriVerify (not another project) with: `curl -s http://localhost:5173/ | grep -o "<title>[^<]*</title>"` — expect `NutriVerify - Nutrition Intelligence Platform`.
- Vite listens on `[::1]:5173` (IPv6 loopback); `curl http://localhost:5173/` works, but avoid tools that resolve localhost to IPv4-only.
