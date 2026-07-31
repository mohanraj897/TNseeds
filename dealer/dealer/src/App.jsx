import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";
const emptyAuth = { name: "", email: "", password: "", phone: "", location: "", role: "farmer" };

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const authHeaders = (token) => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("agrimart-user") || "null"));
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState(emptyAuth);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(""), 3500); };
  const navigate = (next) => { setPage(next); window.scrollTo(0, 0); };

  async function api(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong");
    return data;
  }

  async function loadProducts() {
    try { setProducts(await api("/products")); }
    catch (error) { notify("Start the backend on port 5000 to load live products."); }
  }

  async function loadStocks() {
    try { setStocks(await api("/dealer/stock")); }
    catch (error) { notify("Could not load dealer seed stock."); }
  }

  async function loadPendingRequests() {
    if (!user) return;
    try { setRequests(await api("/dealer/requests/pending", { headers: { Authorization: `Bearer ${user.token}` } })); }
    catch (error) { notify(error.message); }
  }

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (page === "dealer-stock") loadStocks(); }, [page]);
  useEffect(() => {
    if (page === "dealer-dashboard" && ["dealer", "supplier", "admin"].includes(user?.role)) loadPendingRequests();
  }, [page, user]);

  const visibleProducts = useMemo(() => products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())), [products, search]);

  async function submitAuth(event) {
    event.preventDefault();
    try {
      const body = authMode === "register" ? auth : { email: auth.email, password: auth.password };
      const account = await api(`/auth/${authMode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      localStorage.setItem("agrimart-user", JSON.stringify(account));
      setUser(account);
      setAuth(emptyAuth);
      notify(`Welcome, ${account.name}.`);
      navigate(account.role === "dealer" ? "dealer-dashboard" : "dashboard");
    } catch (error) { notify(error.message); }
  }

  async function createProduct(event) {
    event.preventDefault();
    if (!user) return navigate("auth");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const body = { ...form, price: Number(form.price), quantity: Number(form.quantity), type: user.role === "supplier" ? "seed" : "produce" };
    try {
      await api("/products", { method: "POST", headers: authHeaders(user.token), body: JSON.stringify(body) });
      notify("Product published successfully.");
      await loadProducts(); navigate("dashboard");
    } catch (error) { notify(error.message); }
  }

  async function createStock(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/dealer/stock", { method: "POST", headers: authHeaders(user.token), body: JSON.stringify({ ...form, totalQuantity: Number(form.totalQuantity) }) });
      notify("Dealer seed stock is live."); event.currentTarget.reset(); await loadStocks();
    } catch (error) { notify(error.message); }
  }

  async function requestStock(event, stockId) {
    event.preventDefault();
    if (user?.role !== "farmer") { notify("Only farmer accounts can request dealer seed stock."); return; }
    const body = new FormData(event.currentTarget); body.append("seedStockId", stockId);
    try {
      await api("/dealer/requests", { method: "POST", headers: { Authorization: `Bearer ${user.token}` }, body });
      notify("Request sent. Your patta is awaiting verification."); event.currentTarget.reset();
    } catch (error) { notify(error.message); }
  }

  async function updateRequest(id, action) {
    const verify = action === "verify";
    try {
      const path = verify ? `/dealer/requests/${id}/verify` : `/dealer/requests/${id}/approve`;
      const options = { method: "PUT", headers: verify ? authHeaders(user.token) : { Authorization: `Bearer ${user.token}` } };
      if (verify) options.body = JSON.stringify({ decision: "Verified", note: "Patta checked by dealer" });
      const result = await api(path, options);
      notify(result.message || `Request ${verify ? "verified" : "approved"}.`);
      await loadPendingRequests(); await loadStocks();
    } catch (error) { notify(error.message); }
  }

  function logout() { localStorage.removeItem("agrimart-user"); setUser(null); navigate("home"); }
  const seller = ["farmer", "supplier"].includes(user?.role);

  return <div className="agri-app">
    <Header user={user} navigate={navigate} logout={logout} />
    <main className="container">
      {page === "home" && <Home products={products} navigate={navigate} />}
      {(page === "produce" || page === "seed") && <Marketplace type={page} products={visibleProducts} search={search} setSearch={setSearch} />}
      {page === "auth" && <AuthForm mode={authMode} setMode={setAuthMode} value={auth} setValue={setAuth} submit={submitAuth} />}
      {page === "dashboard" && <Dashboard user={user} seller={seller} products={products} navigate={navigate} />}
      {page === "add-product" && <ProductForm user={user} submit={createProduct} />}
      {page === "dealer-stock" && <DealerStock user={user} stocks={stocks} requestStock={requestStock} />}
      {page === "dealer-dashboard" && <DealerDashboard user={user} stocks={stocks} requests={requests} createStock={createStock} updateRequest={updateRequest} />}
    </main>
    {message && <div className="toast">{message}</div>}
    <footer>© 2026 AgriMart · Better markets for a better harvest</footer>
  </div>;
}

function Header({ user, navigate, logout }) {
  return <><header><button className="logo" onClick={() => navigate("home")}>Agri<span>Mart</span></button><button className="searchbar" onClick={() => navigate("produce")}>Search crops, seeds and farming essentials</button><button className="account" onClick={() => navigate(user ? "dashboard" : "auth")}>Hello, {user?.name || "sign in"}<b>{user ? user.role : "Account & Lists"}</b></button>{user && <button className="cart" onClick={logout}>Sign out</button>}</header><nav><button onClick={() => navigate("home")}>Home</button><button onClick={() => navigate("produce")}>Fresh Produce</button><button onClick={() => navigate("seed")}>Seeds & Inputs</button><button onClick={() => navigate("dealer-stock")}>Bulk Seed Stock</button>{["dealer", "supplier", "admin"].includes(user?.role) && <button onClick={() => navigate("dealer-dashboard")}>Dealer Dashboard</button>}</nav></>;
}

function Home({ products, navigate }) { return <><section className="hero"><div><span>India's trusted farm marketplace</span><h1>From field to table,<br />made fair.</h1><p>Fresh produce, quality seeds and verified bulk seed stock in one agricultural marketplace.</p><button className="btn gold" onClick={() => navigate("produce")}>Shop fresh produce</button></div></section><section className="feature"><div><h2>Fresh from the farm</h2><button onClick={() => navigate("produce")}>See all offers →</button></div><div className="product-grid">{products.filter((p) => p.type === "produce").slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}</div></section><section className="seller-cta"><div><h2>Do you grow or supply?</h2><p>Create your account and sell directly to verified buyers.</p></div><button className="btn green" onClick={() => navigate("auth")}>Start selling today</button></section></> }

function Marketplace({ type, products, search, setSearch }) { const list = products.filter((p) => p.type === type); return <><section className="market-title"><small>Verified {type === "seed" ? "suppliers" : "farmers"}</small><h1>{type === "seed" ? "Seed Marketplace" : "Fresh Produce Marketplace"}</h1></section><div className="filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." /></div><div className="product-grid">{list.map((p) => <ProductCard key={p._id} product={p} />)}{!list.length && <p className="empty">No products found.</p>}</div></> }

function ProductCard({ product }) { return <article className="product"><img src={product.image || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80"} alt={product.name} /><div><small>{product.category} · {product.type}</small><h3>{product.name}</h3><b className="price">{money(product.price)} <small>/ {product.unit}</small></b><p className="muted">{product.quantity} {product.unit} available · {product.location}</p></div></article> }

function AuthForm({ mode, setMode, value, setValue, submit }) { const register = mode === "register"; const change = (event) => setValue({ ...value, [event.target.name]: event.target.value }); return <section className="auth"><aside><h1>Grow with AgriMart.</h1><p>Connect farms, suppliers and buyers with transparent agricultural trade.</p></aside><section><h1>{register ? "Create account" : "Welcome back"}</h1><form onSubmit={submit}>{register && <><label>Account role<select name="role" value={value.role} onChange={change}><option value="farmer">Farmer</option><option value="buyer">Buyer</option><option value="supplier">Supplier</option><option value="dealer">Dealer</option></select></label><label>Name<input name="name" value={value.name} onChange={change} required /></label><label>Phone<input name="phone" value={value.phone} onChange={change} /></label><label>Location<input name="location" value={value.location} onChange={change} /></label></>}<label>Email<input name="email" type="email" value={value.email} onChange={change} required /></label><label>Password<input name="password" type="password" value={value.password} onChange={change} minLength="6" required /></label><button className="btn gold wide">{register ? "Create account" : "Sign in"}</button></form><p className="toggle"><button onClick={() => setMode(register ? "login" : "register")}>{register ? "Already registered? Sign in" : "New here? Create account"}</button></p></section></section> }

function Dashboard({ user, seller, products, navigate }) { if (!user) return <AuthRequired navigate={navigate} />; const own = products.filter((p) => p.seller?._id === user._id); return <section className="dashboard"><div className="dash-title"><div><small>{user.role} dashboard</small><h1>Hello, {user.name}!</h1></div>{seller && <button className="btn gold" onClick={() => navigate("add-product")}>Add product</button>}</div><div className="stats"><div><small>Active listings</small><b>{own.length}</b></div><div><small>Account role</small><b>{user.role}</b></div></div><div className="product-grid">{own.map((product) => <ProductCard key={product._id} product={product} />)}</div>{!seller && <button className="btn green" onClick={() => navigate("produce")}>Browse marketplace</button>}</section> }

function ProductForm({ user, submit }) { if (!user || !["farmer", "supplier"].includes(user.role)) return <p className="empty">Only farmer and supplier accounts can publish products.</p>; return <section className="add"><h1>Add a product</h1><form className="add-form" onSubmit={submit}><label>Product name<input name="name" required /></label><label>Category<input name="category" required /></label><label>Price (₹)<input name="price" type="number" min="1" required /></label><label>Quantity<input name="quantity" type="number" min="1" required /></label><label>Unit<select name="unit"><option>kg</option><option>packet</option><option>bag</option></select></label><label>Location<input name="location" required /></label><label>Description<textarea name="description" rows="4" /></label><label>Image URL<input name="image" type="url" /></label><button className="btn gold">Publish listing</button></form></section> }

function DealerStock({ user, stocks, requestStock }) { return <><section className="market-title"><small>Patta verification required</small><h1>Bulk seed stock</h1><p>Farmers can request seed stock by uploading a patta document.</p></section><div className="stock-grid">{stocks.map((stock) => <article className="stock-card" key={stock._id}><div><small>{stock.location}</small><h2>{stock.seedType}</h2><p><b>{stock.availableQuantity} {stock.unit}</b> available</p><p className="muted">Dealer: {stock.dealer?.name}</p></div><form onSubmit={(event) => requestStock(event, stock._id)}><label>Requested quantity<input name="requestedQuantity" type="number" min="0.01" max={stock.availableQuantity} step="0.01" required /></label><label>Patta document (PDF/JPG/PNG)<input name="pattaDocument" type="file" accept=".pdf,.jpg,.jpeg,.png" required /></label><button className="btn green" disabled={user?.role !== "farmer"}>Request stock</button></form></article>)}</div>{!stocks.length && <p className="empty">No bulk seed stock is available.</p>}</> }

function DealerDashboard({ user, stocks, requests, createStock, updateRequest }) { if (!user || !["dealer", "supplier", "admin"].includes(user.role)) return <p className="empty">Dealer access is required.</p>; return <section className="dashboard"><div className="dash-title"><div><small>Dealer control centre</small><h1>Seed stock & patta verification</h1></div></div><form className="add-form" onSubmit={createStock}><h2>Add bulk seed stock</h2><label>Seed type<input name="seedType" required /></label><label>Location<input name="location" required /></label><label>Unit<select name="unit"><option value="ton">ton</option><option value="kg">kg</option><option value="bag">bag</option></select></label><label>Total quantity<input name="totalQuantity" type="number" min="0.01" step="0.01" required /></label><button className="btn gold">Publish bulk stock</button></form><h2>Pending patta verification</h2>{requests.map((request) => <article className="order" key={request._id}><div><b>{request.farmer?.name}</b><p>{request.requestedQuantity} {request.seedStock?.unit} of {request.seedStock?.seedType}</p><a href={`http://localhost:5000${request.pattaDocument?.fileUrl}`} target="_blank" rel="noreferrer">View patta document</a></div><button className="btn outline" onClick={() => updateRequest(request._id, "verify")}>Verify patta</button><button className="btn green" onClick={() => updateRequest(request._id, "approve")}>Approve allocation</button></article>)}{!requests.length && <p className="empty">No pending verification requests.</p>}</section> }

function AuthRequired({ navigate }) { return <p className="empty">Please <button className="btn green" onClick={() => navigate("auth")}>sign in</button> to view your dashboard.</p> }
