import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import '../styles/RegisterPage.css';
import { useAuth } from "../contexts/AuthContext";

// 密码强度验证函数
const validatePassword = (password: string) => {
  const strength = {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const strengthScore = Object.values(strength).filter(Boolean).length;
  return {
    ...strength,
    score: strengthScore,
    strengthText:
      strengthScore >= 5 ? '非常强' :
      strengthScore >= 4 ? '强' :
      strengthScore >= 3 ? '中等' :
      '弱'
  };
};

// 邮箱格式验证函数
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 邀请码基本格式验证（可根据需求调整）
const validateInviteCode = (code: string) => {
  return code.length >= 6 && /^[a-zA-Z0-9\-_]+$/.test(code);
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    inviteCode: '' // 新增邀请码字段
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    inviteCode: '' // 新增邀请码错误字段
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    strengthText: '',
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  // 密码变化时更新强度
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePassword(formData.password));
    } else {
      setPasswordStrength({
        score: 0,
        strengthText: '',
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
    }
  }, [formData.password]);

  // 表单验证函数
  const validateForm = () => {
    const errors = {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      inviteCode: '' // 新增邀请码错误
    };

    let isValid = true;

    // 验证用户名
    if (!formData.username.trim()) {
      errors.username = '用户名不能为空';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
      isValid = false;
    } else if (formData.username.length > 20) {
      errors.username = '用户名不能超过20个字符';
      isValid = false;
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      errors.email = '邮箱不能为空';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 验证密码
    if (!formData.password) {
      errors.password = '密码不能为空';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = '密码至少需要8个字符';
      isValid = false;
    } else if (passwordStrength.score < 3) {
      errors.password = '密码强度不足，请包含大小写字母、数字和特殊字符';
      isValid = false;
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    // 验证邀请码
    if (!formData.inviteCode.trim()) {
      errors.inviteCode = '邀请码不能为空';
      isValid = false;
    } else if (!validateInviteCode(formData.inviteCode)) {
      errors.inviteCode = '邀请码格式不正确（6位以上字母数字组合）';
      isValid = false;
    }

    // // 验证服务条款
    // if (!acceptedTerms) {
    //   setError('请阅读并同意服务条款');
    //   isValid = false;
    // }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          inviteCode: formData.inviteCode // 添加邀请码到请求体
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // 处理邀请码错误
        if (response.status === 403) {
          setFieldErrors(prev => ({
            ...prev,
            inviteCode: data.message || '邀请码无效或已过期'
          }));
          setError('邀请码无效，请检查或联系管理员');
        } else {
          throw new Error(data.message || '注册失败');
        }
        return;
      }

      // 自动登录逻辑
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        authContextLogin(loginData.token);
        navigate('/home');
      } else {
        navigate('/login'); // 注册成功但自动登录失败时跳转登录页
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册过程中发生错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // 清除对应字段的错误信息
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }

    // 清除全局错误信息
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="main-container">
      <div className="system-brand">
        <FontAwesomeIcon
          icon={faBrain}
          className="brand-icon"
          beatFade
        />
        <h1 className="brand-title">
          <span className="brand-main">LinkMind</span>
          <span className="brand-sub">—— 智能学习云脑引擎</span>
        </h1>
        <div className="brand-underline"></div>
      </div>

      <div className="register-container">
        <form
          className="register-form"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <h2 className="register-title">用户注册</h2>
          {error && <div className="error-message">{error}</div>}

          {/* 邀请码输入框 */}
          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faKey} className="input-icon" />
              邀请码
            </label>
            <input
              type="text"
              name="inviteCode"
              className={`form-input ${fieldErrors.inviteCode ? 'error' : ''}`}
              value={formData.inviteCode}
              onChange={handleChange}
              placeholder="请输入您的邀请码"
              required
            />
            {fieldErrors.inviteCode && (
              <div className="field-error">{fieldErrors.inviteCode}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              name="username"
              className={`form-input ${fieldErrors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="3-20个字符"
              required
            />
            {fieldErrors.username && (
              <div className="field-error">{fieldErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input
              type="email"
              name="email"
              className={`form-input ${fieldErrors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              required
            />
            {fieldErrors.email && (
              <div className="field-error">{fieldErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="至少8位，包含大小写字母、数字和特殊字符"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {/* 密码强度指示器 */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-text">
                  密码强度: <span className={`strength-${passwordStrength.score}`}>
                    {passwordStrength.strengthText}
                  </span>
                </div>
                <div className="strength-indicators">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`indicator ${passwordStrength.score >= level ? 'active' : ''}`}
                    ></div>
                  ))}
                </div>
                <div className="password-rules">
                  <div className={`rule ${passwordStrength.hasLength ? 'valid' : ''}`}>
                    <FontAwesomeIcon icon={passwordStrength.hasLength ? faCheckCircle : faTimesCircle} />
                    至少8个字符
                  </div>
                  <div className={`rule ${passwordStrength.hasUppercase ? 'valid' : ''}`}>
                    <FontAwesomeIcon icon={passwordStrength.hasUppercase ? faCheckCircle : faTimesCircle} />
                    包含大写字母
                  </div>
                  <div className={`rule ${passwordStrength.hasLowercase ? 'valid' : ''}`}>
                    <FontAwesomeIcon icon={passwordStrength.hasLowercase ? faCheckCircle : faTimesCircle} />
                    包含小写字母
                  </div>
                  <div className={`rule ${passwordStrength.hasNumber ? 'valid' : ''}`}>
                    <FontAwesomeIcon icon={passwordStrength.hasNumber ? faCheckCircle : faTimesCircle} />
                    包含数字
                  </div>
                  <div className={`rule ${passwordStrength.hasSpecialChar ? 'valid' : ''}`}>
                    <FontAwesomeIcon icon={passwordStrength.hasSpecialChar ? faCheckCircle : faTimesCircle} />
                    包含特殊字符
                  </div>
                </div>
              </div>
            )}

            {fieldErrors.password && (
              <div className="field-error">{fieldErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">确认密码</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="请再次输入密码"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <div className="field-error">{fieldErrors.confirmPassword}</div>
            )}
          </div>

          {/*<div className="terms-container">*/}
          {/*  <input*/}
          {/*    type="checkbox"*/}
          {/*    id="accept-terms"*/}
          {/*    checked={acceptedTerms}*/}
          {/*    onChange={(e) => setAcceptedTerms(e.target.checked)}*/}
          {/*  />*/}
          {/*  <label htmlFor="accept-terms">*/}
          {/*    我已阅读并同意 <a href="/terms" target="_blank" rel="noopener noreferrer">服务条款</a> 和 <a href="/privacy" target="_blank" rel="noopener noreferrer">隐私政策</a>*/}
          {/*  </label>*/}
          {/*</div>*/}

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> 注册中...
              </>
            ) : (
              '立即注册'
            )}
          </button>

          <div className="auth-redirect">
            已有账号？<button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
            >
              去登录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
