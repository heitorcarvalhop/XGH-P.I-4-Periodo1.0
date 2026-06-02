import React, { useState } from 'react';
import { userService } from '../services/api';

const INITIAL_FORM = {
  fullName: '',
  cpf: '',
  birthDate: '',
  phone: '',
  email: '',
  password: ''
};

const AddBarberModal = ({ barbershopId, onClose, onAdded }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.fullName || !form.cpf || !form.birthDate || !form.phone || !form.email || form.password.length < 6) {
      setError('Preencha todos os campos. A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await userService.registerBarber({ ...form, barbershopId });
      onAdded();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="team-modal-overlay">
      <div className="team-modal">
        <div className="team-modal-header">
          <h2>Adicionar barbeiro</h2>
          <button type="button" onClick={onClose}>X</button>
        </div>
        {error && <div className="team-modal-error">{error}</div>}
        <form onSubmit={handleSubmit} className="team-modal-form">
          <input name="fullName" placeholder="Nome completo" value={form.fullName} onChange={handleChange} />
          <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} />
          <input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
          <input name="phone" placeholder="Telefone" value={form.phone} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email de acesso" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Senha inicial" value={form.password} onChange={handleChange} />
          <div className="team-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-add-barber" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar barbeiro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBarberModal;
