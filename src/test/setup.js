// Setup file for test environment
import '@testing-library/jest-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-19';

configure({ adapter: new Adapter() });