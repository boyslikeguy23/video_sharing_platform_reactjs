import { Form } from "formik";
import React from "react";
import "./Register.css";

const Register = () => {
  return (
    <div>
      <div class="flex">
        <div>
            <img
            className="h-[80vh]"
          //src="https://static.cdninstagram.com/images/instagram/xig/homepage/phones/home-phones-2x.png?__makehaste_cache_breaker=73SVAexZgBW"
          //src="https://as2.ftcdn.net/jpg/05/85/06/93/1000_F_585069392_1PeQ3rClCfyUoc6vLL7KyA4FL24CEw9t.jpg"
          src="public/home-phones-2x.png"
          alt="Instagram Homepage"
        />
        </div>
        
        <div class="">
          <img
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
            alt="Instagram Logo"
          />

          <form>
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <button type="submit">Log In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
