package com.laptopstore.service.impl;

import com.laptopstore.entity.CardDoHoa;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.CardDoHoaRepository;
import com.laptopstore.service.CardDoHoaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CardDoHoaServiceImpl implements CardDoHoaService {

    private final CardDoHoaRepository cardDoHoaRepository;

    @Override
    public List<CardDoHoa> getAll() {
        return cardDoHoaRepository.findAll();
    }

    @Override
    public CardDoHoa getById(Integer id) {
        return cardDoHoaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card đồ họa", "id", id));
    }

    @Override
    public CardDoHoa create(CardDoHoa cardDoHoa) {
        return cardDoHoaRepository.save(cardDoHoa);
    }

    @Override
    public CardDoHoa update(Integer id, CardDoHoa cardDoHoa) {
        CardDoHoa existing = getById(id);
        existing.setTenCard(cardDoHoa.getTenCard());
        return cardDoHoaRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        CardDoHoa existing = getById(id);
        cardDoHoaRepository.delete(existing);
    }
}
