

rng = list(range(1970, 2013))

str = 'SELECT l.country_code, l.country_name'

for r in rng:
    str += ', pop."{}"::FLOAT as pop{}, ghg."{}"::FLOAT*1000 as ghg{}, (ghg."{}"::FLOAT/pop."{}"::FLOAT)*1000 as pcghg{}' .format(
        r, r, r, r, r, r, r)

str += ' FROM population as pop JOIN green_house_gas as ghg on ghg.country_code = pop.country_code JOIN countries on pop.country_code = countries.country_code ORDER BY country_name;'
