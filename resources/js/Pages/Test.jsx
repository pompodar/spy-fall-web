import useSWR from 'swr';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { signInWithGoogle } from "./config/firebase";


export default function Test() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const csrf = () => axios.get('/sanctum/csrf-cookie');

  const register = async () => {
    axios
      .post('https://auth.blobsandtrees.online/register', formData)
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        if (error.response.status !== 422) throw error;
        // Handle error response
      });
  };

  const getUser = async () => {
    try {
      const { data } = await axios.get('https://auth.blobsandtrees.online/api/user');
      console.log(data);
    } catch (e) {
      console.warn('Error ', e);
    }
  };

  const login = async () => {
    console.log(formData);
    await csrf();

    axios
      .post('https://auth.blobsandtrees.online/login', formData)
      .then(async(data) => {
        console.log(data);
        await getUser();

      })
      .catch((error) => {
        if (error.response.status !== 422) throw error;
        // Handle error response
      });
  };

  useEffect(() => {
    // Pre-fill form with test data on component mount
    setFormData({
      // name: 'tatest',
      email: 'tatest@test.test',
      password: 'asdfghjkl',
      // password_confirmation: 'asdfghjkl',
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //register();
    login();
  };

  const handleRegister = () => {
    // Define the action when the register button is clicked
    // For example, you can navigate to a registration page
    // navigate('/register');
  };

  return (
    <>
    <button class="login-with-google-btn" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <h1>{localStorage.getItem("name")}</h1>
      <h1>{localStorage.getItem("email")}</h1>
      <img src={localStorage.getItem("profilePic")} />
      <h1>Test</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Confirm Password:
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
      <button onClick={handleRegister}>Go to Register Page</button>
    </>
  );
}
