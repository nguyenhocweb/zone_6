async function test() {
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'lamlich@zonesix.vn', password: 'lamlich123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  console.log('Login success, user:', loginData.data.user.name, 'role:', loginData.data.user.role);

  console.log('\n--- TEST 1: Sending week_start_date: "[object Object]" ---');
  const res1 = await fetch('http://localhost:8000/api/v1/scheduling/auto-assign-from-db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ week_start_date: '[object Object]', evening_shift_mode: 2 })
  });
  console.log('Status 1:', res1.status);
  console.log('Body 1:', await res1.text());

  console.log('\n--- TEST 2: Sending week_start_date: "2026-10-19" ---');
  const res2 = await fetch('http://localhost:8000/api/v1/scheduling/auto-assign-from-db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ week_start_date: '2026-10-19', evening_shift_mode: 2 })
  });
  console.log('Status 2:', res2.status);
  const data2 = await res2.json();
  console.log('Body 2 success:', data2.success, 'total_slots_filled:', data2.total_slots_filled);
}
test();
