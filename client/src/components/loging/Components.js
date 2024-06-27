import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 0 2rem;
`;

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
`;

export const Title = styled.h2`
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333333;
`;

export const Input = styled.input`
  background-color: #f6f6f6;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px 15px;
  margin-bottom: 1rem;
  width: 100%;
  font-size: 1rem;
  &::placeholder {
    color: #aaa;
  }
`;

export const Select = styled.select`
  background-color: #f6f6f6;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px 15px;
  margin-bottom: 1rem;
  width: 100%;
  font-size: 1rem;
  color: #666;
`;

export const Button = styled.button`
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 1rem;
  &:hover {
    background-color: #ff3a1b;
  }
`;

export const GhostButton = styled(Button)`
  background-color: transparent;
  border: 2px solid #ff4b2b;
  color: #ff4b2b;
  &:hover {
    background-color: #ff4b2b;
    color: #ffffff;
  }
`;

export const Anchor = styled.p`
  color: #333333;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;
