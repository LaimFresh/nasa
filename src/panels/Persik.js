import {
    Panel,
    PanelHeader,
    Header,
    Button,
    Div,
    FormItem,
    Select,
    Input,
    Card,
    CardGrid,
    Text,
    Group,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useState } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';

const API_KEY = 'MGOhtPomOuht51sQtifQ8uiCZyMCoT02X97AxkJ2';

export const NasaPanel = ({ id }) => {
    const routeNavigator = useRouteNavigator();
    const [apiType, setApiType] = useState('apod');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [photos, setPhotos] = useState([]);

    const fetchNasaData = async () => {
        try {
            let url = '';
            let params = {
                api_key: API_KEY
            };

            if (apiType === 'apod') {
                url = 'https://api.nasa.gov/planetary/apod'; 
                params.start_date = startDate;
                params.end_date = endDate;
            } else if (apiType === 'mars') {
                url = 'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos'; 
                params.earth_date = startDate;
            } else if (apiType === 'earth') {
                url = `https://api.nasa.gov/EPIC/api/natural/date/${startDate}`; 
            } else if (apiType === 'asteroids') {
                url = 'https://api.nasa.gov/neo/rest/v1/feed'; 
                params.start_date = startDate;
                params.end_date = endDate;
            }

            const response = await axios.get(url, { params });

            if (apiType === 'apod') {
                setPhotos(Array.isArray(response.data) ? response.data : [response.data]);
            } else if (apiType === 'mars') {
                setPhotos(response.data.photos.slice(0, 25));
            } else if (apiType === 'earth') {
                setPhotos(
                    response.data.map((item) => ({
                        ...item,
                        img_src: `https://epic.gsfc.nasa.gov/archive/natural/${startDate 
                            .split('-')
                            .join('/')}/png/${item.image}.png`,
                    }))
                );
            } else if (apiType === 'asteroids') {
                const asteroids = [];
                const dates = Object.keys(response.data.near_earth_objects);

                for (const date of dates) {
                    const items = response.data.near_earth_objects[date];
                    for (const item of items) {
                        asteroids.push({
                            id: item.id,
                            name: item.name,
                            date: date,
                            diameter: item.estimated_diameter.meters.estimated_diameter_max,
                            hazardous: item.is_potentially_hazardous_asteroid,
                            url: item.nasa_jpl_url,
                            close_approach: item.close_approach_data[0]?.miss_distance.kilometers || '—',
                        });
                    }
                }

                setPhotos(asteroids);
            }
        } catch (e) {
            console.error('Ошибка при загрузке данных:', e.message);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>Фото NASA</PanelHeader>
            <Group>
                <Div>
                    <Button
                        size="l"
                        stretched
                        mode="secondary"
                        onClick={() => routeNavigator.push('/')}
                    >
                        Назад
                    </Button>
                </Div>
            </Group>
            <Group header={<Header mode="secondary">Параметры поиска</Header>}>
                <FormItem top="Категория фото">
                    <Select
                        value={apiType}
                        onChange={(e) => setApiType(e.target.value)}
                        options={[
                            { value: 'apod', label: 'Фото дня' },
                            { value: 'mars', label: 'Фото с марсохода' },
                            { value: 'earth', label: 'Фото планеты Земля' },
                            { value: 'asteroids', label: 'Ближайшие астероиды' },
                        ]}
                    />
                </FormItem>
                <FormItem top="С">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </FormItem>

                {apiType !== 'mars' && (
                    <FormItem top="По">
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </FormItem>
                )}

                <FormItem>
                    <Button size="l" stretched onClick={fetchNasaData}>
                        Найти фото
                    </Button>
                </FormItem>
            </Group>
            {photos.length > 0 && (
                <Group header={<Header mode="secondary">Результаты</Header>}>
                    <CardGrid size="m">
                        {photos.map((photo, index) => (
                            <Card key={index}>
                                <div style={{ padding: '12px' }}>
                                    {/* Фото */}
                                    {photo.img_src && (
                                        <img
                                            src={photo.img_src}
                                            alt={photo.title || `NASA Photo ${index}`}
                                            style={{
                                                width: '100%',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    )}

                                    {/* Астероиды */}
                                    {photo.id && !photo.img_src && (
                                        <>
                                            <Text weight="2">Название: {photo.name}</Text>
                                            <Text>Дата: {photo.date}</Text>
                                            <Text>
                                                Диаметр: ~{Math.round(photo.diameter)} м
                                            </Text>
                                            <Text>
                                                Расстояние до Земли: {photo.close_approach} км
                                            </Text>
                                            <Text
                                                style={{
                                                    color: photo.hazardous ? 'red' : 'green',
                                                }}
                                            >
                                                {photo.hazardous ? 'Опасный' : 'Не опасен'}
                                            </Text>
                                            <a
                                                href={photo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block',
                                                    marginTop: '8px',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                Подробнее
                                            </a>
                                        </>
                                    )}

                                    {/* Описание для APOD */}
                                    {photo.explanation && (
                                        <Text style={{ marginTop: '8px' }}>
                                            {photo.explanation.substring(0, 100)}...
                                        </Text>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </CardGrid>
                </Group>
            )}
        </Panel>
    );
};