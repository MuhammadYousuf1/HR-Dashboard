/* ── HR Payroll Dashboard – dashboard.js ─────────────────────────── */

let pieChart, barChart, lineChart, dataTable;
let allTableData = [];

const CHART_COLORS = [
  '#4f8ef7','#7c5df9','#22c55e','#f97316','#06b6d4',
  '#a855f7','#f43f5e','#eab308','#14b8a6','#64748b'
];

/* ── Helpers ──────────────────────────────────────────────────────── */
function fmt(n) {
  return '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtNum(n) {
  return Number(n).toLocaleString('en-US');
}

/* ── Spinner ──────────────────────────────────────────────────────── */
function showSpinner() {
  let el = document.getElementById('spinner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'spinner';
    el.className = 'loading-overlay';
    el.innerHTML = '<div class="spinner-ring"></div>';
    document.body.appendChild(el);
  }
  el.style.display = 'flex';
}
function hideSpinner() {
  const el = document.getElementById('spinner');
  if (el) el.style.display = 'none';
}

/* ── Chart helpers ────────────────────────────────────────────────── */
const darkGrid = {
  color: 'rgba(255,255,255,.06)'
};
const darkTick = {
  color: '#8893a7', font: { size: 11 }
};

function buildPie(data) {
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: CHART_COLORS,
        borderColor: '#161a24',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8893a7', font: {size:11}, boxWidth: 12, padding: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}`
          }
        }
      },
      cutout: '60%'
    }
  });
}

function buildBar(data) {
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: data.labels.map(n => n.split(' ')[0]),
      datasets: [{
        label: 'Total Pay',
        data: data.values,
        backgroundColor: CHART_COLORS.slice(0,data.labels.length),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${fmt(ctx.parsed.x)}`
          }
        }
      },
      scales: {
        x: {
          grid: darkGrid,
          ticks: { ...darkTick, callback: v => '$'+(v/1000).toFixed(0)+'k' }
        },
        y: { grid: { display: false }, ticks: darkTick }
      }
    }
  });
}

function buildLine(data) {
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Monthly Payroll',
        data: data.values,
        borderColor: '#4f8ef7',
        backgroundColor: 'rgba(79,142,247,.15)',
        borderWidth: 2.5,
        pointBackgroundColor: '#4f8ef7',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${fmt(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: { grid: darkGrid, ticks: darkTick },
        y: {
          grid: darkGrid,
          ticks: { ...darkTick, callback: v => '$'+(v/1000).toFixed(0)+'k' }
        }
      }
    }
  });
}

/* ── Table ────────────────────────────────────────────────────────── */
function renderTable(rows) {
  allTableData = rows;
  document.getElementById('rec-count').textContent = fmtNum(rows.length) + ' records';

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="color:#8893a7">${r.period_start}</td>
      <td style="color:#8893a7">${r.period_end}</td>
      <td style="color:#8893a7">${r.date_paid}</td>
      <td>${fmtNum(r.hours)}</td>
      <td><strong>${r.name}</strong></td>
      <td style="color:#8893a7">${r.position}</td>
      <td>$${r.pay_rate}/hr</td>
      <td><strong style="color:#22c55e">${fmt(r.amount)}</strong></td>
      <td style="color:#8893a7; max-width:200px; white-space:normal">${r.comments || '—'}</td>
    </tr>
  `).join('');

  if (dataTable) { dataTable.destroy(); dataTable = null; }
  dataTable = $('#payrollTable').DataTable({
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    order: [],
    language: { search: '' },
    dom: '<"d-flex justify-content-between align-items-center mb-2"lf>rtip'
  });
}

/* ── Top 5 ────────────────────────────────────────────────────────── */
const rankClass = ['rank-1','rank-2','rank-3','rank-4','rank-5'];

function renderTop5(list) {
  const el = document.getElementById('top5List');
  el.innerHTML = list.map((e, i) => `
    <div class="top5-item">
      <div class="top5-rank ${rankClass[i]}">${i+1}</div>
      <div class="top5-info">
        <div class="top5-name">${e.name}</div>
      </div>
      <div class="top5-amount">${fmt(e.amount)}</div>
    </div>
  `).join('');
}

/* ── KPI Cards ────────────────────────────────────────────────────── */
function renderCards(c) {
  document.getElementById('kpi-payroll').textContent   = fmt(c.total_payroll);
  document.getElementById('kpi-employees').textContent = fmtNum(c.total_employees);
  document.getElementById('kpi-active').textContent    = fmtNum(c.active_employees);
  document.getElementById('kpi-hours').textContent     = fmtNum(c.total_hours);
  document.getElementById('kpi-rate').textContent      = '$' + c.avg_pay_rate + '/hr';
}

/* ── Main loader ──────────────────────────────────────────────────── */
function loadData() {
  const position = document.getElementById('f-position').value;
  const month    = document.getElementById('f-month').value;
  const search   = document.getElementById('f-search').value;

  showSpinner();

  fetch(`/api/summary?position=${encodeURIComponent(position)}&month=${encodeURIComponent(month)}&search=${encodeURIComponent(search)}`)
    .then(r => r.json())
    .then(data => {
      renderCards(data.cards);
      buildPie(data.pie);
      buildBar(data.bar);
      buildLine(data.line);
      renderTable(data.table);
      renderTop5(data.top5);
    })
    .catch(err => console.error('Error loading data:', err))
    .finally(() => hideSpinner());
}

/* ── CSV Export ───────────────────────────────────────────────────── */
function exportCSV() {
  if (!allTableData.length) return;
  const headers = ['Period Start','Period End','Date Paid','Hours','Employee Name','Position','Pay Rate','Amount','Comments'];
  const rows = allTableData.map(r => [
    r.period_start, r.period_end, r.date_paid, r.hours,
    r.name, r.position, '$'+r.pay_rate+'/hr', r.amount, r.comments || ''
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'payroll_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Event listeners ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Live search debounce
  let debounce;
  document.getElementById('f-search').addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(loadData, 350);
  });

  // Filter selects
  ['f-position','f-month'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadData);
  });
});