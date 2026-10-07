# Đọc một trường từ JSON trên stdin của hook (không cần jq). Dùng: val=$(printf '%s' "$INPUT" | json_get tool_input.command)
json_get() {
  node -e '
    let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
      try { let v=JSON.parse(s); for (const k of process.argv[1].split(".")) v = v?.[k]; process.stdout.write(v==null?"":typeof v==="string"?v:JSON.stringify(v)); }
      catch { process.stdout.write(""); }
    });' "$1"
}
