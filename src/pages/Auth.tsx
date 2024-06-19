import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    const emailRedirectTo =
      window.location.hostname === "khugo.github.io"
        ? window.location.origin + "/simple-habits/"
        : window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      <div className="row flex flex-center">
        <div className="col-6 form-widget">
          <h1 className="header">Supabase + React</h1>
          <p className="description">
            Sign in via magic link with your email below
          </p>
          <form className="form-widget" onSubmit={handleLogin}>
            <div>
              <input
                className="inputField"
                type="email"
                placeholder="Your email"
                value={email}
                required={true}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <button className={"button block"} disabled={loading}>
                {loading ? <span>Loading</span> : <span>Send magic link</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ManualLink />
    </div>
  );
}

const ManualLink = () => {
  const [loginLink, setLoginLink] = useState<string | null>(null);

  const submit = () => {
    if (!loginLink) return;
    window.location.href = loginLink;
  };

  return (
    <div className="flex flex-col mt-2">
      <h2>Click the link or paste it here on PWAs</h2>
      <textarea
        placeholder="Paste login link from email here"
        onChange={(e) => setLoginLink(e.target.value)}
      />
      <button onClick={submit} disabled={!loginLink} className="mr-auto">
        Done
      </button>
    </div>
  );
};
