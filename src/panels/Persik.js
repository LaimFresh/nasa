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
    Text, Group,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useState } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';

const API_KEY = 'r5MT1FhW1oYeQmvnfZiVM99DXimD7jRS9D09Jg6j';

// eslint-disable-next-line react/prop-types
export const NasaPanel = ({ id }) => {
    const routeNavigator = useRouteNavigator();
    const [apiType, setApiType] = useState('apod');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [photos, setPhotos] = useState([]);
    // eslint-disable-next-line no-unused-vars
    let [urlTest] = useState();

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
                url = 'https://api.nasa.gov/EPIC/api/natural/date/' + startDate;
            }
            const response = await axios.get(url, { params });
            if (apiType === 'apod') {
                setPhotos(Array.isArray(response.data) ? response.data : [response.data]);
            } else if (apiType === 'mars') {
                setPhotos(response.data.photos.slice(0, 25)); // Limit to 25 photos
            } else if (apiType === 'earth') {
                setPhotos(response.data.map(item => ({
                    ...item,
                    img_src: `https://epic.gsfc.nasa.gov/archive/natural/${startDate.split('-').join('/')}/png/${item.image}.png`
                })));
                console.log(url);
            }
    }catch (e)
        { /* empty */ }
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
                <Text value={urlTest}></Text>
                <FormItem top="Катигория фото">
                    <Select
                        value={apiType}
                        onChange={(e) => setApiType(e.target.value)}
                        options={[
                            { value: 'apod', label: 'Фото дня' },
                            { value: 'mars', label: 'Фото с марсохода' },
                            { value: 'earth', label: 'Фото планеты Земли' }
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
                    <Button
                        size="l"
                        stretched
                        onClick={fetchNasaData}
                    >
                        Найти фото
                    </Button>
                </FormItem>
            </Group>
            {photos.length > 0 && (
                <Group header={<Header mode="secondary">Фото</Header>}>
                    <CardGrid size="m">
                        {photos.map((photo, index) => (
                            <Card key={index}>
                                <div style={{ padding: '12px' }}>
                                    {photo.img_src ? (
                                        <img
                                            src={photo.img_src}
                                            alt={photo.title || `NASA Photo ${index}`}
                                            style={{ width: '100%', borderRadius: '8px' }}
                                        />
                                    ) : photo.url && (
                                        <img
                                            src={photo.url}
                                            alt={photo.title || `NASA Photo ${index}`}
                                            style={{ width: '100%', borderRadius: '8px' }}
                                        />
                                    )}
                                    <Text weight="2" style={{ marginTop: '8px' }}>
                                        {photo.title || `Фото №${index + 1}`}
                                    </Text>
                                    {photo.date && (
                                        <Text weight="3" style={{ color: 'var(--text_subhead)' }}>
                                            {new Date(photo.date).toLocaleDateString()}
                                        </Text>
                                    )}
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
