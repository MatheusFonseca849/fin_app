import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useTransactions from '../hooks/useTransactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ user }) => {
  const { transactions, loading, error, getCurrentBalance, getMonthlyStats } = useTransactions(user);
  const currentBalance = getCurrentBalance();
  const { income, expenses } = getMonthlyStats();

  // Build balance history for the last 6 months from real user transactions
  const buildBalanceHistory = (txns, months = 6) => {
    const now = new Date();
    // Build an array of month keys from oldest to newest
    const monthKeys = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) });
    }

    // Sum net amounts per month
    const monthlyNet = Object.fromEntries(monthKeys.map(m => [m.key, 0]));
    txns.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyNet[key] !== undefined) {
        monthlyNet[key] += t.amount; // amount already positive for crédito and negative for débito
      }
    });

    // Compute starting balance as the sum of all transactions BEFORE the first month in the window
    const firstMonth = monthKeys[0];
    const firstMonthDate = new Date(parseInt(firstMonth.key.split('-')[0], 10), parseInt(firstMonth.key.split('-')[1], 10) - 1, 1);
    const startingBalance = txns
      .filter(t => new Date(t.date) < firstMonthDate)
      .reduce((sum, t) => sum + t.amount, 0);

    // Build cumulative balance over months starting from the true running balance
    const labels = [];
    const balances = [];
    let cumulative = startingBalance;
    monthKeys.forEach(m => {
      cumulative += monthlyNet[m.key];
      labels.push(m.label);
      balances.push(Number(cumulative.toFixed(2)));
    });

    return { labels, balances };
  };

  const balanceHistory = buildBalanceHistory(transactions, 6);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: balanceHistory.labels,
    datasets: [
      {
        label: 'Saldo',
        data: balanceHistory.balances,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Histórico de Saldo - Últimos 6 Meses',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          }
        }
      }
    }
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.name}!</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className={`stat-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
            R$ {Math.abs(currentBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Saldo Atual</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value positive">
            R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Receitas do Mês</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value negative">
            R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Gastos do Mês</div>
        </div>
        
        <div className="stat-card">
          <div className={`stat-value ${(income - expenses) >= 0 ? 'positive' : 'negative'}`}>
            R$ {Math.abs(income - expenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Resultado do Mês</div>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
