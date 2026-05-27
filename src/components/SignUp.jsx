import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'


function SignUp() {
    const navigate = useNavigate()

   
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on type
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())       e.firstName = "First name is required";
    if (!form.lastName.trim())        e.lastName = "Last name is required";
    if (!form.username.trim())        e.username = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Enter a valid email";
    if (form.password.length < 8)     e.password = "Min. 8 characters";
    if (form.confirmPassword !== form.password)
    e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async() => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
     
    try{
      const res = await fetch("http://localhost:3000/signup",{
        method : "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstname,
          lastname: form.lastname,
          username: form.username,
          email: form.email,
          password: form.password
        })
      })

      const data = await res.json()
      if(data.success){
        navigate("/fullprofile")
      } else{
        setErrors({email: data.message})
      }
    }
    catch(err){
      console.log("Signup failed: ", err)
    }
    navigate("/fullprofile");
  };

  return (
      <div className="signup-page">
      <div className="signup-card">

        <div className="brand">
          
          <span className="brand-name">ChitChat</span>
        </div>

        <h1>Create your account</h1>
        <p className="sub">Join thousands already chatting on ChitChat.</p>

        <div className="row">
          <div className={`field ${errors.firstName ? "err" : ""}`}>
            <label>First name</label>
            <input name="firstName" placeholder="Alex"
              value={form.firstName} onChange={handleChange} />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>
          <div className={`field ${errors.lastName ? "err" : ""}`}>
            <label>Last name</label>
            <input name="lastName" placeholder="Johnson"
              value={form.lastName} onChange={handleChange} />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
        </div>

        <div className={`field ${errors.username ? "err" : ""}`}>
          <label>Username</label>
          <input name="username" placeholder="alexj"
            value={form.username} onChange={handleChange} />
          <span className="hint">This is how others will find you</span>
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className={`field ${errors.email ? "err" : ""}`}>
          <label>Email</label>
          <input name="email" type="email" placeholder="alex@email.com"
            value={form.email} onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className={`field ${errors.password ? "err" : ""}`}>
          <label>Password</label>
          <div className="field-wrap">
            <input name="password" type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={form.password} onChange={handleChange} />
            <button className="eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? "Hide" :"Show"}
            </button>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className={`field ${errors.confirmPassword ? "err" : ""}`}>
          <label>Confirm password</label>
          <div className="field-wrap">
            <input name="confirmPassword" type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={form.confirmPassword} onChange={handleChange} />
            <button className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Complete full profile
        </button>

        <p className="signin">Already have an account? <a href="/login">Sign in</a></p>
      </div>
    </div>
  )
}

export default SignUp
