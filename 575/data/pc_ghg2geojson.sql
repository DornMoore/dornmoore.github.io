SELECT
	row_to_json ( fc ) 
FROM
	(
	SELECT
		'FeatureCollection' AS TYPE,
		array_to_json (
		ARRAY_AGG ( f )) AS features 
	FROM
		(
		SELECT
			'Feature' AS TYPE,
			ST_AsGeoJSON ( lg.geom ) :: json AS geometry,
			row_to_json ((
				SELECT
					l 
				FROM
					(
					SELECT
						country_code,
						country_name,
						pop1970,
						ghg1970,
						pcghg1970,
						pop1971,
						ghg1971,
						pcghg1971,
						pop1972,
						ghg1972,
						pcghg1972,
						pop1973,
						ghg1973,
						pcghg1973,
						pop1974,
						ghg1974,
						pcghg1974,
						pop1975,
						ghg1975,
						pcghg1975,
						pop1976,
						ghg1976,
						pcghg1976,
						pop1977,
						ghg1977,
						pcghg1977,
						pop1978,
						ghg1978,
						pcghg1978,
						pop1979,
						ghg1979,
						pcghg1979,
						pop1980,
						ghg1980,
						pcghg1980,
						pop1981,
						ghg1981,
						pcghg1981,
						pop1982,
						ghg1982,
						pcghg1982,
						pop1983,
						ghg1983,
						pcghg1983,
						pop1984,
						ghg1984,
						pcghg1984,
						pop1985,
						ghg1985,
						pcghg1985,
						pop1986,
						ghg1986,
						pcghg1986,
						pop1987,
						ghg1987,
						pcghg1987,
						pop1988,
						ghg1988,
						pcghg1988,
						pop1989,
						ghg1989,
						pcghg1989,
						pop1990,
						ghg1990,
						pcghg1990,
						pop1991,
						ghg1991,
						pcghg1991,
						pop1992,
						ghg1992,
						pcghg1992,
						pop1993,
						ghg1993,
						pcghg1993,
						pop1994,
						ghg1994,
						pcghg1994,
						pop1995,
						ghg1995,
						pcghg1995,
						pop1996,
						ghg1996,
						pcghg1996,
						pop1997,
						ghg1997,
						pcghg1997,
						pop1998,
						ghg1998,
						pcghg1998,
						pop1999,
						ghg1999,
						pcghg1999,
						pop2000,
						ghg2000,
						pcghg2000,
						pop2001,
						ghg2001,
						pcghg2001,
						pop2002,
						ghg2002,
						pcghg2002,
						pop2003,
						ghg2003,
						pcghg2003,
						pop2004,
						ghg2004,
						pcghg2004,
						pop2005,
						ghg2005,
						pcghg2005,
						pop2006,
						ghg2006,
						pcghg2006,
						pop2007,
						ghg2007,
						pcghg2007,
						pop2008,
						ghg2008,
						pcghg2008,
						pop2009,
						ghg2009,
						pcghg2009,
						pop2010,
						ghg2010,
						pcghg2010,
						pop2011,
						ghg2011,
						pcghg2011,
						pop2012,
						ghg2012,
						pcghg2012 
					) AS l 
				)) AS properties 
		FROM
			(
			SELECT
				pop.country_code,
				country_name,
				geom,
				pop."1970" :: FLOAT AS pop1970,
				ghg."1970" :: FLOAT * 1000 AS ghg1970,
				( ghg."1970" :: FLOAT / pop."1970" :: FLOAT ) * 1000 AS pcghg1970,
				pop."1971" :: FLOAT AS pop1971,
				ghg."1971" :: FLOAT * 1000 AS ghg1971,
				( ghg."1971" :: FLOAT / pop."1971" :: FLOAT ) * 1000 AS pcghg1971,
				pop."1972" :: FLOAT AS pop1972,
				ghg."1972" :: FLOAT * 1000 AS ghg1972,
				( ghg."1972" :: FLOAT / pop."1972" :: FLOAT ) * 1000 AS pcghg1972,
				pop."1973" :: FLOAT AS pop1973,
				ghg."1973" :: FLOAT * 1000 AS ghg1973,
				( ghg."1973" :: FLOAT / pop."1973" :: FLOAT ) * 1000 AS pcghg1973,
				pop."1974" :: FLOAT AS pop1974,
				ghg."1974" :: FLOAT * 1000 AS ghg1974,
				( ghg."1974" :: FLOAT / pop."1974" :: FLOAT ) * 1000 AS pcghg1974,
				pop."1975" :: FLOAT AS pop1975,
				ghg."1975" :: FLOAT * 1000 AS ghg1975,
				( ghg."1975" :: FLOAT / pop."1975" :: FLOAT ) * 1000 AS pcghg1975,
				pop."1976" :: FLOAT AS pop1976,
				ghg."1976" :: FLOAT * 1000 AS ghg1976,
				( ghg."1976" :: FLOAT / pop."1976" :: FLOAT ) * 1000 AS pcghg1976,
				pop."1977" :: FLOAT AS pop1977,
				ghg."1977" :: FLOAT * 1000 AS ghg1977,
				( ghg."1977" :: FLOAT / pop."1977" :: FLOAT ) * 1000 AS pcghg1977,
				pop."1978" :: FLOAT AS pop1978,
				ghg."1978" :: FLOAT * 1000 AS ghg1978,
				( ghg."1978" :: FLOAT / pop."1978" :: FLOAT ) * 1000 AS pcghg1978,
				pop."1979" :: FLOAT AS pop1979,
				ghg."1979" :: FLOAT * 1000 AS ghg1979,
				( ghg."1979" :: FLOAT / pop."1979" :: FLOAT ) * 1000 AS pcghg1979,
				pop."1980" :: FLOAT AS pop1980,
				ghg."1980" :: FLOAT * 1000 AS ghg1980,
				( ghg."1980" :: FLOAT / pop."1980" :: FLOAT ) * 1000 AS pcghg1980,
				pop."1981" :: FLOAT AS pop1981,
				ghg."1981" :: FLOAT * 1000 AS ghg1981,
				( ghg."1981" :: FLOAT / pop."1981" :: FLOAT ) * 1000 AS pcghg1981,
				pop."1982" :: FLOAT AS pop1982,
				ghg."1982" :: FLOAT * 1000 AS ghg1982,
				( ghg."1982" :: FLOAT / pop."1982" :: FLOAT ) * 1000 AS pcghg1982,
				pop."1983" :: FLOAT AS pop1983,
				ghg."1983" :: FLOAT * 1000 AS ghg1983,
				( ghg."1983" :: FLOAT / pop."1983" :: FLOAT ) * 1000 AS pcghg1983,
				pop."1984" :: FLOAT AS pop1984,
				ghg."1984" :: FLOAT * 1000 AS ghg1984,
				( ghg."1984" :: FLOAT / pop."1984" :: FLOAT ) * 1000 AS pcghg1984,
				pop."1985" :: FLOAT AS pop1985,
				ghg."1985" :: FLOAT * 1000 AS ghg1985,
				( ghg."1985" :: FLOAT / pop."1985" :: FLOAT ) * 1000 AS pcghg1985,
				pop."1986" :: FLOAT AS pop1986,
				ghg."1986" :: FLOAT * 1000 AS ghg1986,
				( ghg."1986" :: FLOAT / pop."1986" :: FLOAT ) * 1000 AS pcghg1986,
				pop."1987" :: FLOAT AS pop1987,
				ghg."1987" :: FLOAT * 1000 AS ghg1987,
				( ghg."1987" :: FLOAT / pop."1987" :: FLOAT ) * 1000 AS pcghg1987,
				pop."1988" :: FLOAT AS pop1988,
				ghg."1988" :: FLOAT * 1000 AS ghg1988,
				( ghg."1988" :: FLOAT / pop."1988" :: FLOAT ) * 1000 AS pcghg1988,
				pop."1989" :: FLOAT AS pop1989,
				ghg."1989" :: FLOAT * 1000 AS ghg1989,
				( ghg."1989" :: FLOAT / pop."1989" :: FLOAT ) * 1000 AS pcghg1989,
				pop."1990" :: FLOAT AS pop1990,
				ghg."1990" :: FLOAT * 1000 AS ghg1990,
				( ghg."1990" :: FLOAT / pop."1990" :: FLOAT ) * 1000 AS pcghg1990,
				pop."1991" :: FLOAT AS pop1991,
				ghg."1991" :: FLOAT * 1000 AS ghg1991,
				( ghg."1991" :: FLOAT / pop."1991" :: FLOAT ) * 1000 AS pcghg1991,
				pop."1992" :: FLOAT AS pop1992,
				ghg."1992" :: FLOAT * 1000 AS ghg1992,
				( ghg."1992" :: FLOAT / pop."1992" :: FLOAT ) * 1000 AS pcghg1992,
				pop."1993" :: FLOAT AS pop1993,
				ghg."1993" :: FLOAT * 1000 AS ghg1993,
				( ghg."1993" :: FLOAT / pop."1993" :: FLOAT ) * 1000 AS pcghg1993,
				pop."1994" :: FLOAT AS pop1994,
				ghg."1994" :: FLOAT * 1000 AS ghg1994,
				( ghg."1994" :: FLOAT / pop."1994" :: FLOAT ) * 1000 AS pcghg1994,
				pop."1995" :: FLOAT AS pop1995,
				ghg."1995" :: FLOAT * 1000 AS ghg1995,
				( ghg."1995" :: FLOAT / pop."1995" :: FLOAT ) * 1000 AS pcghg1995,
				pop."1996" :: FLOAT AS pop1996,
				ghg."1996" :: FLOAT * 1000 AS ghg1996,
				( ghg."1996" :: FLOAT / pop."1996" :: FLOAT ) * 1000 AS pcghg1996,
				pop."1997" :: FLOAT AS pop1997,
				ghg."1997" :: FLOAT * 1000 AS ghg1997,
				( ghg."1997" :: FLOAT / pop."1997" :: FLOAT ) * 1000 AS pcghg1997,
				pop."1998" :: FLOAT AS pop1998,
				ghg."1998" :: FLOAT * 1000 AS ghg1998,
				( ghg."1998" :: FLOAT / pop."1998" :: FLOAT ) * 1000 AS pcghg1998,
				pop."1999" :: FLOAT AS pop1999,
				ghg."1999" :: FLOAT * 1000 AS ghg1999,
				( ghg."1999" :: FLOAT / pop."1999" :: FLOAT ) * 1000 AS pcghg1999,
				pop."2000" :: FLOAT AS pop2000,
				ghg."2000" :: FLOAT * 1000 AS ghg2000,
				( ghg."2000" :: FLOAT / pop."2000" :: FLOAT ) * 1000 AS pcghg2000,
				pop."2001" :: FLOAT AS pop2001,
				ghg."2001" :: FLOAT * 1000 AS ghg2001,
				( ghg."2001" :: FLOAT / pop."2001" :: FLOAT ) * 1000 AS pcghg2001,
				pop."2002" :: FLOAT AS pop2002,
				ghg."2002" :: FLOAT * 1000 AS ghg2002,
				( ghg."2002" :: FLOAT / pop."2002" :: FLOAT ) * 1000 AS pcghg2002,
				pop."2003" :: FLOAT AS pop2003,
				ghg."2003" :: FLOAT * 1000 AS ghg2003,
				( ghg."2003" :: FLOAT / pop."2003" :: FLOAT ) * 1000 AS pcghg2003,
				pop."2004" :: FLOAT AS pop2004,
				ghg."2004" :: FLOAT * 1000 AS ghg2004,
				( ghg."2004" :: FLOAT / pop."2004" :: FLOAT ) * 1000 AS pcghg2004,
				pop."2005" :: FLOAT AS pop2005,
				ghg."2005" :: FLOAT * 1000 AS ghg2005,
				( ghg."2005" :: FLOAT / pop."2005" :: FLOAT ) * 1000 AS pcghg2005,
				pop."2006" :: FLOAT AS pop2006,
				ghg."2006" :: FLOAT * 1000 AS ghg2006,
				( ghg."2006" :: FLOAT / pop."2006" :: FLOAT ) * 1000 AS pcghg2006,
				pop."2007" :: FLOAT AS pop2007,
				ghg."2007" :: FLOAT * 1000 AS ghg2007,
				( ghg."2007" :: FLOAT / pop."2007" :: FLOAT ) * 1000 AS pcghg2007,
				pop."2008" :: FLOAT AS pop2008,
				ghg."2008" :: FLOAT * 1000 AS ghg2008,
				( ghg."2008" :: FLOAT / pop."2008" :: FLOAT ) * 1000 AS pcghg2008,
				pop."2009" :: FLOAT AS pop2009,
				ghg."2009" :: FLOAT * 1000 AS ghg2009,
				( ghg."2009" :: FLOAT / pop."2009" :: FLOAT ) * 1000 AS pcghg2009,
				pop."2010" :: FLOAT AS pop2010,
				ghg."2010" :: FLOAT * 1000 AS ghg2010,
				( ghg."2010" :: FLOAT / pop."2010" :: FLOAT ) * 1000 AS pcghg2010,
				pop."2011" :: FLOAT AS pop2011,
				ghg."2011" :: FLOAT * 1000 AS ghg2011,
				( ghg."2011" :: FLOAT / pop."2011" :: FLOAT ) * 1000 AS pcghg2011,
				pop."2012" :: FLOAT AS pop2012,
				ghg."2012" :: FLOAT * 1000 AS ghg2012,
				( ghg."2012" :: FLOAT / pop."2012" :: FLOAT ) * 1000 AS pcghg2012 
			FROM
				population AS pop
				JOIN green_house_gas AS ghg ON ghg.country_code = pop.country_code
				JOIN countries ON pop.country_code = countries.country_code 
			) AS lg 
		) AS f 
	) AS fc;