$f = "src\App.jsx"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Remover funcao lerMTR
$c = [regex]::Replace($c, 'const lerMTR = async arq => \{[\s\S]*?\n  \};', '')

# Remover estados ldMTR e erMTR
$c = $c.Replace("  const [ldMTR, setLdMTR]   = useState(false);`r`n", '')
$c = $c.Replace("  const [erMTR, setErMTR]   = useState(`"`");`r`n", '')
$c = $c.Replace("  const [ldMTR, setLdMTR]   = useState(false);`n", '')
$c = $c.Replace("  const [erMTR, setErMTR]   = useState(`"`");`n", '')

# Remover UI de upload MTR (bloco inteiro)
$c = [regex]::Replace($c, '\{/\* MTR[\s\S]*?\}\s*\}', '')
$c = [regex]::Replace($c, '<div style=\{\{\.\.\.CD,border:"2px solid #5a4fcf33[\s\S]*?</div>\s*</div>', '')

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)

# Verificar
if ($c.Contains("lerMTR")) {
    Write-Host "AINDA TEM lerMTR"
} else {
    Write-Host "MTR removido com sucesso!"
}
