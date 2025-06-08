import axios from 'axios';
import { useEffect, useReducer } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

const initialState = {
  searchQuery: '',
  searchField: 'all',
  selectedFile: '',
  searchResults: [],
  availableFields: [],
  availableFiles: [],
  stats: null,
  loading: false,
  reloading: false,
  error: '',
};

// Reducer 函數

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_SEARCH_FIELD':
      return { ...state, searchField: action.payload };

    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload };

    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };

    case 'SET_INITIAL_DATA':
      return {
        ...state,
        availableFields: action.payload.fields,
        availableFiles: action.payload.files,
        stats: action.payload.stats,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_ERROR':
      return { ...state, error: '' };

    case 'SET_RELOADING':
      return { ...state, reloading: action.payload };

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 載入初始數據
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [fieldsRes, filesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/fields`),
        axios.get(`${API_BASE}/files`),
        axios.get(`${API_BASE}/stats`),
      ]);

      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: {
          fields: fieldsRes.data.fields,
          files: filesRes.data.files,
          stats: statsRes.data.stats,
        },
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: '無法載入初始數據，請確認後端服務器已啟動' });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!state.searchQuery.trim()) {
      dispatch({ type: 'SET_ERROR', payload: '請輸入搜尋關鍵字' });
      return;
    }

    dispatch({ type: 'RESET_ERROR' });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const params = {
        query: state.searchQuery,
        field: state.searchField,
      };

      if (state.selectedFile) {
        params.fileName = state.selectedFile;
      }

      const response = await axios.get(`${API_BASE}/search`, { params });
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data.results });
    } catch (error) {
      console.error('Search failed:', error);
      dispatch({ type: 'SET_ERROR', payload: '搜尋失敗，請稍後再試' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleReloadData = async () => {
    dispatch({ type: 'SET_RELOADING', payload: true });
    dispatch({ type: 'RESET_ERROR' });

    try {
      // 呼叫重新載入 API
      await axios.post(`${API_BASE}/reload`);

      // 重新載入初始數據
      await loadInitialData();

      // 清空搜尋結果
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });

      // 顯示成功訊息（可選）
      dispatch({ type: 'SET_ERROR', payload: '✅ 資料重新載入成功！' });

      // 3秒後清除成功訊息
      setTimeout(() => {
        dispatch({ type: 'RESET_ERROR' });
      }, 3000);
    } catch (error) {
      console.error('Reload failed:', error);
      dispatch({ type: 'SET_ERROR', payload: '重新載入失敗，請稍後再試' });
    } finally {
      dispatch({ type: 'SET_RELOADING', payload: false });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="">
          <h1>📊 Excel 零組件資料查詢系統</h1>
        </div>
        {state.stats && (
          <div className="stats-bar">
            <span>📁 {state.stats.totalFiles} 個檔案</span>
            <span>🔧 {state.stats.totalComponents} 個零組件</span>
            <span>🏢 {state.stats.companies.length} 家公司</span>
          </div>
        )}
      </header>

      <main className="main-content">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
              <input
                type="text"
                placeholder="輸入搜尋關鍵字..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                className="search-input"
              />

              <div className="filter-group">
                <label>搜尋欄位:</label>
                <select
                  value={state.searchField}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_FIELD', payload: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">所有欄位</option>
                  {state.availableFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>指定檔案:</label>
                <select
                  value={state.selectedFile}
                  onChange={(e) => dispatch({ type: 'SET_SELECTED_FILE', payload: e.target.value })}
                  className="filter-select"
                >
                  <option value="">所有檔案</option>
                  {state.availableFiles.map((file) => (
                    <option key={file} value={file}>
                      {file}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={state.loading} className="search-button">
                {state.loading ? '搜尋中...' : '🔍 搜尋'}
              </button>

              <button onClick={handleReloadData} disabled={state.reloading} className="reload-button" title="重新載入所有 Excel 檔案資料">
                {state.reloading ? '🔄 載入中...' : '🔄 重新載入'}
              </button>
            </div>
          </form>

          {state.error && (
            <div className={`message ${state.error.startsWith('✅') ? 'success-message' : 'error-message'}`}>
              {state.error.startsWith('✅') ? state.error : `❌ ${state.error}`}
            </div>
          )}
        </div>

        <div className="results-section">
          {state.searchResults.length > 0 && (
            <>
              <div className="results-header">
                <h2>搜尋結果 ({state.searchResults.length} 筆)</h2>
              </div>

              <div className="">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>序號</th>
                      <th>產品名稱</th>
                      <th>公司</th>
                      <th>型號</th>
                      <th>零組件名稱</th>
                      <th>製造商</th>
                      <th>零組件型號</th>
                      <th>技術規格</th>
                      <th>驗證標準</th>
                      <th>檔案來源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.searchResults.map((result, index) => (
                      <tr key={index} className="result-row">
                        <td>{index + 1}</td>
                        <td>{result.productInfo.productName || '未知產品'}</td>
                        <td>{result.productInfo.companyName}</td>
                        <td>{result.productInfo.model}</td>
                        <td>{result.componentData['零組件(材料)名稱'] || '-'}</td>
                        <td>{result.componentData['製造商'] || '-'}</td>
                        <td>{result.componentData['型號(零組件)'] || '-'}</td>
                        <td>{result.componentData['技術規格(電氣規格)'] || '-'}</td>
                        <td>{result.componentData['驗證標準'] || '-'}</td>
                        <td className="file-cell">
                          <div className="file-name">{result.fileName}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {state.searchQuery && state.searchResults.length === 0 && !state.loading && (
          <div className="no-results">
            <p>🔍 未找到符合條件的結果</p>
            <p>請嘗試:</p>
            <ul>
              <li>使用不同的關鍵字</li>
              <li>選擇不同的搜尋欄位</li>
              <li>檢查搜尋條件</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
